import re
import os
import time
from urllib3.exceptions import MaxRetryError
from selenium.common.exceptions import ElementClickInterceptedException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromiumService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

from allauth.account.models import EmailAddress
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.conf import settings
from django.test import Client
from django.contrib.contenttypes.models import ContentType
import logging

logger = logging.getLogger(__name__)


class SeleniumHelper:
    """
    Methods for manipulating django and the browser for testing purposes.
    """

    login_page = "/"

    def find_urls(self, string):
        return re.findall(
            (
                "http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|"
                "(?:%[0-9a-fA-F][0-9a-fA-F]))+"
            ),
            string,
        )

    # create django data
    def create_user(
        self, username="User", email="test@example.com", passtext="p4ssw0rd"
    ):
        User = get_user_model()
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(passtext),
            is_active=True,
        )
        user.save()

        # avoid the unverified-email login trap
        EmailAddress.objects.create(
            user=user, email=email, verified=True, primary=True
        ).save()

        return user

    # drive browser
    def login_user(self, user, driver, client):
        client.force_login(user=user)
        cookie = client.cookies[settings.SESSION_COOKIE_NAME]
        # output the cookie to the console for debugging
        logger.debug("cookie: %s" % cookie.value)
        if driver.current_url == "data:,":
            # To set the cookie at the right domain we load the front page.
            driver.get(f"{self.live_server_url}{self.login_page}")
            WebDriverWait(driver, self.wait_time).until(
                EC.presence_of_element_located((By.ID, "id-login"))
            )
        driver.add_cookie(
            {
                "name": settings.SESSION_COOKIE_NAME,
                "value": cookie.value,
                "secure": False,
                "path": "/",
            }
        )

    def login_user_manually(self, user, driver, passtext="p4ssw0rd"):
        username = user.username
        driver.delete_cookie(settings.SESSION_COOKIE_NAME)
        driver.get("{}{}".format(self.live_server_url, "/"))
        driver.find_element(By.ID, "id-login").send_keys(username)
        driver.find_element(By.ID, "id-password").send_keys(passtext)
        driver.find_element(By.ID, "login-submit").click()
        # Wait until there is an element with the ID user-preferences
        # which is only present on the dashboard.
        WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "user-preferences"))
        )

    def logout_user(self, driver, client):
        client.logout()
        driver.delete_cookie(settings.SESSION_COOKIE_NAME)

    def wait_until_file_exists(self, path, wait_time):
        count = 0
        while not os.path.exists(path):
            time.sleep(1)
            count += 1
            if count > wait_time:
                break

    def retry_click(self, driver, selector, retries=5):
        count = 0
        while count < retries:
            try:
                WebDriverWait(driver, self.wait_time).until(
                    EC.element_to_be_clickable(selector)
                ).click()
                break
            except ElementClickInterceptedException:
                count += 1
                time.sleep(1)

    @classmethod
    def get_drivers(cls, number, download_dir=False, user_agent=False):
        # django native clients, to be used for faster login.
        clients = []
        for i in range(number):
            clients.append(Client())
        drivers = []
        wait_time = 0
        options = webdriver.ChromeOptions()
        options.add_argument("--kiosk-printing")
        options.add_argument("--safebrowsing-disable-download-protection")
        options.add_argument("--safebrowsing-disable-extension-blacklist")
        prefs = {
            "profile.password_manager_leak_detection": False,
        }
        if download_dir:
            prefs["download.default_directory"] = download_dir
            prefs["download.prompt_for_download"] = False
            prefs["download.directory_upgrade"] = True
        options.add_experimental_option("prefs", prefs)
        if user_agent:
            options.add_argument(f"user-agent={user_agent}")
        if os.getenv("CI"):
            options.binary_location = "/usr/bin/google-chrome-stable"
            if os.getenv("DEBUG_MODE") != "1":
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            wait_time = 20
        else:
            wait_time = 6
        for i in range(number):
            driver_env = os.environ.copy()
            if os.getenv("CI") and os.getenv("DEBUG_MODE") == "1" and i < 2:
                driver_env["DISPLAY"] = f":{99 - i}"
            driver = webdriver.Chrome(
                service=ChromiumService(
                    ChromeDriverManager(
                        chrome_type=ChromeType.GOOGLE
                    ).install(),
                    env=driver_env,
                ),
                options=options,
            )
            # Set sizes of browsers so that all buttons are visible.
            driver.set_window_position(0, 0)
            driver.set_window_size(1920, 1080)
            drivers.append(driver)
        cls.drivers = drivers
        return {"clients": clients, "drivers": drivers, "wait_time": wait_time}

    def setUp(self):
        # Clear ContentType cache during testing to prevent FK constraint errors
        # Content types get new IDs after each test but cached values don't update
        ContentType.objects.clear_cache()
        self.addCleanup(ContentType.objects.clear_cache)
        return super().setUp()

    def tearDown(self):
        # Source: https://stackoverflow.com/a/39606065
        result = self._outcome.result
        ok = all(
            test != self for test, text in result.errors + result.failures
        )
        if ok:
            for driver in self.drivers:
                self.leave_site(driver)
        else:
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            for id, driver in enumerate(self.drivers, start=1):
                screenshotfile = (
                    f"screenshots/driver{id}-{self._testMethodName}.png"
                )
                logger.info(f"Saving {screenshotfile}")
                driver.save_screenshot(screenshotfile)
                self.leave_site(driver)
        return super().tearDown()

    def leave_site(self, driver):
        try:
            driver.execute_script(
                "if (window.theApp) {window.theApp.page = null;}"
            )
            driver.get("data:,")
        except MaxRetryError:
            pass
