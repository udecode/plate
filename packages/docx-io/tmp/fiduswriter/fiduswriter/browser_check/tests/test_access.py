from selenium.webdriver.common.by import By
from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper


class AccessTest(SeleniumHelper, ChannelsLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.wait_time = 10

    def setUp(self):
        self.base_url = self.live_server_url
        return super().setUp()

    def test_ie11(self):
        driver_data = self.get_drivers(
            1,
            user_agent=(
                "Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; "
                "Trident/7.0; rv:11.0) like Gecko"
            ),
        )
        driver = driver_data["drivers"][0]
        driver.implicitly_wait(driver_data["wait_time"])
        driver.get(self.base_url + "/")
        h1 = driver.find_element(By.CSS_SELECTOR, "h1")
        self.assertEqual(h1.text, "Browser not supported")
        driver.quit()

    def test_robots(self):
        driver_data = self.get_drivers(
            1,
            user_agent=(
                "Mozilla/5.0 (compatible; Googlebot/2.1; "
                "+http://www.google.com/bot.html)"
            ),
        )
        driver = driver_data["drivers"][0]
        driver.implicitly_wait(driver_data["wait_time"])
        driver.get(self.base_url + "/robots.txt")
        body = driver.find_element(By.CSS_SELECTOR, "body")
        self.assertEqual(
            body.text,
            "User-agent: *\nDisallow: /document/\nDisallow: /bibliography/",
        )
        driver.quit()

    def test_hello(self):
        driver_data = self.get_drivers(1)
        driver = driver_data["drivers"][0]
        driver.implicitly_wait(driver_data["wait_time"])
        driver.get(self.base_url + "/hello-fiduswriter")
        body = driver.find_element(By.CSS_SELECTOR, "body")
        self.assertEqual(body.text, "Hello from Fidus Writer")
        driver.quit()
