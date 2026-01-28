from urllib.parse import urljoin

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper


class AdminTest(SeleniumHelper, ChannelsLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        driver_data = cls.get_drivers(2)
        cls.driver = driver_data["drivers"][0]
        cls.driver2 = driver_data["drivers"][1]
        cls.client = driver_data["clients"][0]
        cls.client2 = driver_data["clients"][1]
        cls.driver.implicitly_wait(driver_data["wait_time"])
        cls.driver2.implicitly_wait(driver_data["wait_time"])
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.driver2.quit()
        super().tearDownClass()

    def setUp(self):
        self.admin = self.create_user(
            username="Admin", email="admin@admin.com", passtext="password"
        )
        self.admin.is_superuser = True
        self.admin.is_staff = True
        self.admin.save()
        self.user1 = self.create_user(
            username="User1", email="user1@user.com", passtext="password"
        )
        self.base_url = self.live_server_url
        self.base_admin_url = urljoin(self.live_server_url, "/admin/")

    def test_system_message(self):
        self.login_user(self.user1, self.driver, self.client)
        self.login_user(self.admin, self.driver2, self.client2)
        self.driver.get(self.base_url + "/")
        self.driver2.get(self.base_admin_url)
        self.driver2.find_element(
            By.CSS_SELECTOR, "a[href='/admin/console/']"
        ).click()
        self.assertEqual(
            self.driver2.find_element(
                By.CSS_SELECTOR, "#session_count:not(:empty)"
            ).text,
            "1",
        )
        self.driver2.find_element(By.ID, "user_message").click()
        ActionChains(self.driver2).key_down(Keys.CONTROL).send_keys(
            "a"
        ).key_up(Keys.CONTROL).send_keys("Anyone out there?").perform()
        self.driver2.find_element(By.ID, "submit_user_message").click()
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, ".ui-dialog p").text,
            "Anyone out there?",
        )
