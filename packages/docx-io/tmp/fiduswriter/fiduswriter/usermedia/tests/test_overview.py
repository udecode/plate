import os
import time
import sys
from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from django.conf import settings


class UsermediaOverviewTest(SeleniumHelper, ChannelsLiveServerTestCase):
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
        super().tearDown()
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 3)

    def test_overview(self):
        driver = self.driver
        driver.get(f"{self.base_url}/usermedia/")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'All categories'])[1]/following::button[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[1]",
        ).clear()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[1]",
        ).send_keys("landscape")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::span[3]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[2]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[2]",
        ).clear()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[2]",
        ).send_keys("people")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::span[4]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[3]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[3]",
        ).clear()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::input[3]",
        ).send_keys("scientific")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::button[2]",
        ).click()
        driver.refresh()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'All categories'])[1]/following::button[1]",
        ).click()
        self.assertEqual(
            "landscape",
            driver.find_element(By.ID, "categoryTitle_1").get_attribute(
                "value"
            ),
        )
        self.assertEqual(
            "people",
            driver.find_element(By.ID, "categoryTitle_2").get_attribute(
                "value"
            ),
        )
        self.assertEqual(
            "scientific",
            driver.find_element(By.ID, "categoryTitle_3").get_attribute(
                "value"
            ),
        )
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Submit'])[1]/following::button[1]",
        ).click()
        driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload new image (Alt-u)']"
        ).click()
        driver.find_element(By.NAME, "title").click()
        driver.find_element(By.NAME, "title").send_keys("An image")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Select categories'])[1]/following::label[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'landscape'])[1]/following::label[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'people'])[1]/following::label[1]",
        ).click()
        # image path
        imagePath = os.path.join(
            settings.PROJECT_PATH, "usermedia/tests/uploads/image.png"
        )
        driver.find_element(By.NAME, "image").send_keys(imagePath)
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'scientific'])[1]/following::button[1]",
        ).click()
        image_title = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "edit-image"))
        )
        self.assertEqual("An image", image_title.text)
        search_input = driver.find_element(
            By.CSS_SELECTOR,
            ".fw-overview-menu-item .fw-button input[type=search]",
        )
        search_input.click()
        search_input.send_keys("fish")
        self.assertEqual(
            "No images found",
            driver.find_element(
                By.XPATH,
                "(.//*[normalize-space(text()) and normalize-space(.)="
                "'Size (px)'])[1]/following::td[1]",
            ).text,
        )
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        self.assertEqual(
            "An image",
            driver.find_element(
                By.XPATH,
                "(.//*[normalize-space(text()) and normalize-space(.)="
                "'Size (px)'])[1]/following::span[3]",
            ).text,
        )
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'PNG'])[1]/following::i[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Confirm deletion'])[1]/following::button[2]",
        ).click()
        image_placeholder = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "datatable-empty"))
        )
        self.assertEqual(
            "File Size (px) Added\nNo images available", image_placeholder.text
        )
        self.assertEqual([], self.verificationErrors)
