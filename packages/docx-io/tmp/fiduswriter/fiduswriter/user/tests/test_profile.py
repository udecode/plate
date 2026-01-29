import time
import os

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from selenium.common.exceptions import StaleElementReferenceException

from testing.mail import get_outbox, empty_outbox, delete_outbox
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import override_settings

MAIL_STORAGE_NAME = "user_profile"


@override_settings(MAIL_STORAGE_NAME=MAIL_STORAGE_NAME)
@override_settings(EMAIL_BACKEND="testing.mail.EmailBackend")
class ProfileTest(SeleniumHelper, ChannelsLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        driver_data = cls.get_drivers(1)
        cls.driver = driver_data["drivers"][0]
        cls.client = driver_data["clients"][0]
        cls.driver.implicitly_wait(driver_data["wait_time"])
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        delete_outbox(MAIL_STORAGE_NAME)
        super().tearDownClass()

    def setUp(self):
        self.base_url = self.live_server_url
        self.verificationErrors = []
        self.accept_next_alert = True
        self.user = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter1"
        )
        self.login_user(self.user, self.driver, self.client)

    def tearDown(self):
        empty_outbox(MAIL_STORAGE_NAME)
        self.assertEqual([], self.verificationErrors)
        return super().tearDown()

    def assertInfoAlert(self, message):
        i = 0
        message_found = False
        while i < 100:
            i = i + 1
            try:
                if (
                    self.driver.find_element(
                        By.CSS_SELECTOR,
                        "body #alerts-outer-wrapper .alerts-info",
                    ).text
                    == message
                ):
                    message_found = True
                    break
                else:
                    time.sleep(0.1)
                    continue
            except StaleElementReferenceException:
                time.sleep(0.1)
                continue
        self.assertTrue(message_found)

    def test_edit_profile(self):
        User = get_user_model()
        driver = self.driver
        driver.get(self.base_url + "/")
        driver.find_element(By.ID, "preferences-btn").click()
        driver.find_element(By.CSS_SELECTOR, ".fw-avatar-card").click()
        driver.find_element(By.ID, "first_name").clear()
        driver.find_element(By.ID, "first_name").send_keys("Snowman")
        driver.find_element(By.ID, "last_name").clear()
        driver.find_element(By.ID, "last_name").send_keys("Yeti")
        driver.find_element(By.ID, "submit-profile").click()
        pwd_button = driver.find_element(By.ID, "fw-edit-profile-pwd")
        WebDriverWait(self.driver, self.wait_time).until(
            EC.staleness_of(pwd_button)
        )
        driver.find_element(By.ID, "fw-edit-profile-pwd").click()
        driver.find_element(By.ID, "old-password-input").clear()
        driver.find_element(By.ID, "old-password-input").send_keys("otter1")
        driver.find_element(By.ID, "new-password-input1").clear()
        driver.find_element(By.ID, "new-password-input1").send_keys("otter2")
        driver.find_element(By.ID, "new-password-input2").clear()
        driver.find_element(By.ID, "new-password-input2").send_keys("otter2")
        driver.find_element(By.XPATH, "(//button[@type='button'])[2]").click()
        self.assertInfoAlert("The password has been changed.")
        driver.find_element(By.ID, "fw-edit-profile-pwd").click()
        driver.find_element(By.ID, "old-password-input").clear()
        driver.find_element(By.ID, "old-password-input").send_keys("otter2")
        driver.find_element(By.ID, "new-password-input1").clear()
        driver.find_element(By.ID, "new-password-input1").send_keys("otter1")
        driver.find_element(By.ID, "new-password-input2").clear()
        driver.find_element(By.ID, "new-password-input2").send_keys("otter1")
        driver.find_element(By.XPATH, "(//button[@type='button'])[2]").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, "#fw-change-pwd-dialog")
            )
        )
        driver.refresh()
        try:
            self.assertEqual(
                "Yeti",
                driver.find_element(By.ID, "last_name").get_attribute("value"),
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        try:
            self.assertEqual(
                "Snowman",
                driver.find_element(By.ID, "first_name").get_attribute(
                    "value"
                ),
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        try:
            self.assertEqual(
                "Yeti",
                driver.find_element(By.ID, "username").get_attribute("value"),
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))

        # Test avatar upload
        self.assertEqual(
            len(driver.find_elements(By.CSS_SELECTOR, "#profile-avatar img")),
            0,
        )
        driver.find_element(By.ID, "edit-avatar-btn").click()
        driver.find_element(
            By.XPATH, '//*[normalize-space()="Change picture"]'
        ).click()

        image_path = os.path.join(
            settings.PROJECT_PATH, "document/tests/uploads/image.png"
        )
        driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog input[type=file]"
        ).send_keys(image_path)
        driver.find_element(
            By.XPATH, '//*[normalize-space()="Upload"]'
        ).click()
        self.assertEqual(
            len(driver.find_elements(By.CSS_SELECTOR, "#profile-avatar img")),
            1,
        )
        driver.find_element(By.ID, "edit-avatar-btn").click()
        driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete picture"]'
        ).click()
        driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        time.sleep(1)
        self.assertEqual(
            len(driver.find_elements(By.CSS_SELECTOR, "#profile-avatar img")),
            0,
        )

        # Test emails
        driver.find_element(By.ID, "add-profile-email").click()
        driver.find_element(By.ID, "new-profile-email").send_keys(
            "yeti@snowman2.com"
        )
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        self.assertInfoAlert("Confirmation e-mail sent to: yeti@snowman2.com")
        assert (
            self.driver.find_element(
                By.CSS_SELECTOR,
                ".profile-email-table tbody tr:nth-child(2) .emailaddress",
            ).text
            == "yeti@snowman2.com"
        )
        time.sleep(2)
        outbox = get_outbox(MAIL_STORAGE_NAME)
        self.assertEqual(1, len(outbox))
        # We check that yeti@snowman2.com is not verified and does not have a
        # radio button for primary email account
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR,
                    (
                        ".profile-email-table tbody tr:nth-child(2) .fa-check, "
                        ".profile-email-table tbody tr:nth-child(2) "
                        ".primary-email-radio"
                    ),
                )
            ),
            0,
        )
        urls = self.find_urls(outbox[0].body)
        self.driver.get(urls[0])
        login_title = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-login-title"
        ).text.upper()
        self.assertEqual(login_title, "CONFIRM E-MAIL ADDRESS")
        self.driver.find_element(By.ID, "submit").click()
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR,
                    (
                        ".profile-email-table tbody tr:nth-child(2) .fa-check, "
                        ".profile-email-table tbody tr:nth-child(2) "
                        ".primary-email-radio"
                    ),
                )
            ),
            2,
        )
        self.driver.find_element(
            By.CSS_SELECTOR,
            ".profile-email-table tbody tr:nth-child(2) .primary-email-radio",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog-buttonset .fw-dark"
        ).click()
        self.assertInfoAlert("The primary email has been updated.")
        self.driver.find_element(
            By.CSS_SELECTOR,
            ".profile-email-table tbody tr:nth-child(1) .delete-email",
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        self.assertInfoAlert("Email successfully deleted!")
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".profile-email-table tbody tr"
                )
            ),
            2,
        )
        driver.find_element(By.ID, "add-profile-email").click()
        driver.find_element(By.ID, "new-profile-email").send_keys(
            "yeti@snowman3.com"
        )
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        self.assertInfoAlert("Confirmation e-mail sent to: yeti@snowman3.com")
        assert (
            self.driver.find_element(
                By.CSS_SELECTOR,
                ".profile-email-table tbody tr:nth-child(2) .emailaddress",
            ).text
            == "yeti@snowman3.com"
        )
        time.sleep(2)
        outbox = get_outbox(MAIL_STORAGE_NAME)
        self.assertEqual(2, len(outbox))
        driver.find_element(By.ID, "add-profile-email").click()
        driver.find_element(By.ID, "new-profile-email").send_keys(
            "yeti@snowman4.com"
        )
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        self.assertInfoAlert("Confirmation e-mail sent to: yeti@snowman4.com")
        assert (
            self.driver.find_element(
                By.CSS_SELECTOR,
                ".profile-email-table tbody tr:nth-child(3) .emailaddress",
            ).text
            == "yeti@snowman4.com"
        )
        time.sleep(2)
        outbox = get_outbox(MAIL_STORAGE_NAME)
        self.assertEqual(3, len(outbox))
        # This time we log out first. We should then be redirected to the page
        # that tells us to log in after verification.
        self.driver.find_element(By.ID, "preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.title_is("Login - Fidus Writer")
        )
        urls = self.find_urls(outbox[1].body)
        self.driver.get(urls[0])
        login_title = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-login-title"
        ).text.upper()
        self.assertEqual(login_title, "CONFIRM E-MAIL ADDRESS")
        self.driver.find_element(By.ID, "submit").click()
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(
                By.CSS_SELECTOR, ".fw-contents.prelogin h1"
            ).text,
            "Thanks for verifying!",
        )
        # This time we log in as a different user and then try to verify the
        # email. This should log us out automatically.
        user2 = self.create_user(
            username="Yeti2", email="yeti@snowman5.com", passtext="otter1"
        )
        self.login_user(user2, self.driver, self.client)
        driver.get(self.base_url + "/")
        urls = self.find_urls(outbox[2].body)
        self.driver.get(urls[0])
        login_title = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-login-title"
        ).text.upper()
        self.assertEqual(login_title, "CONFIRM E-MAIL ADDRESS")
        self.driver.find_element(By.ID, "submit").click()
        time.sleep(1)
        assert (
            self.driver.find_element(
                By.CSS_SELECTOR, ".fw-contents.prelogin h1"
            ).text
            == "Thanks for verifying!"
        )
        # Log in and delete account
        self.login_user(user2, self.driver, self.client)
        self.driver.get(self.base_url + "/")
        driver.find_element(By.ID, "preferences-btn").click()
        driver.find_element(By.CSS_SELECTOR, ".fw-avatar-card").click()
        driver.find_element(By.ID, "delete-account").click()
        driver.find_element(By.ID, "username-confirmation").send_keys("Yeti2")
        driver.find_element(By.ID, "password").send_keys("otter1")
        self.assertEqual(len(User.objects.filter(username="Yeti2")), 1)
        driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        time.sleep(1)
        login_header = self.driver.find_elements(
            By.CSS_SELECTOR, "h1.fw-login-title"
        )
        self.assertEqual(len(login_header), 1)
        self.assertEqual(len(User.objects.filter(username="Yeti2")), 0)

    def is_element_present(self, how, what):
        try:
            self.driver.find_element(by=how, value=what)
        except NoSuchElementException:
            return False
        return True

    def test_language_preference(self):
        User = get_user_model()
        driver = self.driver
        driver.get(self.base_url + "/")

        # Go to profile page
        driver.find_element(By.ID, "preferences-btn").click()
        driver.find_element(By.CSS_SELECTOR, ".fw-avatar-card").click()

        # Find the language dropdown
        language_dropdown = driver.find_element(By.ID, "language")

        # Check if dropdown exists and has options
        self.assertTrue(self.is_element_present(By.ID, "language"))

        # Initially language should be default (empty)
        self.assertEqual(
            language_dropdown.get_attribute("value"),
            "",
            "Initial language should be default (empty)",
        )

        # Change language to German
        select = driver.find_element(By.ID, "language")
        select.find_element(By.CSS_SELECTOR, "option[value='de']").click()

        # Save the profile
        driver.find_element(By.ID, "submit-profile").click()

        time.sleep(1)

        # Reload the page to see if the language was saved
        driver.refresh()

        # Wait for page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "language"))
        )

        # Check if the language is now German
        select = driver.find_element(By.ID, "language")
        self.assertEqual(
            select.get_attribute("value"),
            "de",
            "Language should be set to German",
        )

        # Change language back to default
        select.find_element(By.CSS_SELECTOR, "option[value='']").click()

        # Save the profile
        driver.find_element(By.ID, "submit-profile").click()

        time.sleep(1)

        # Check if the user in the database has the updated language
        user = User.objects.get(username="Yeti")
        self.assertEqual(
            user.language, None, "Language should be reset to default (None)"
        )

        # Set language to Spanish
        driver.refresh()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "language"))
        )
        select = driver.find_element(By.ID, "language")
        select.find_element(By.CSS_SELECTOR, "option[value='es']").click()
        driver.find_element(By.ID, "submit-profile").click()

        # Wait for the save to complete
        time.sleep(1)

        # Log out to test if language persists on login
        driver.find_element(By.ID, "preferences-btn").click()

        driver.find_element(
            By.XPATH, '//*[normalize-space()="Cerrar sesión"]'
        ).click()

        # Wait for login page
        WebDriverWait(self.driver, self.wait_time).until(
            EC.title_is("Login - Fidus Writer")
        )

        # Login again
        driver.find_element(By.ID, "id-login").send_keys("Yeti")
        driver.find_element(By.ID, "id-password").send_keys("otter1")
        driver.find_element(By.ID, "login-submit").click()

        # Wait for dashboard page
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "preferences-btn"))
        )

        # Go to profile page
        driver.find_element(By.ID, "preferences-btn").click()
        driver.find_element(By.CSS_SELECTOR, ".fw-avatar-card").click()

        # Check if the language is still Spanish
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "language"))
        )
        select = driver.find_element(By.ID, "language")
        self.assertEqual(
            select.get_attribute("value"),
            "es",
            "Language should still be set to Spanish after logout/login",
        )

        # Check if the user in the database has the updated language
        user = User.objects.get(username="Yeti")
        self.assertEqual(
            user.language,
            "es",
            "Language should be set to Spanish in database",
        )
