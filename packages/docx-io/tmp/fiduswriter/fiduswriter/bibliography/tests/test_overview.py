import os
import time
from tempfile import mkdtemp

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from django.conf import settings

from testing.selenium_helper import SeleniumHelper
from channels.testing import ChannelsLiveServerTestCase


class BibliographyOverviewTest(SeleniumHelper, ChannelsLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.download_dir = mkdtemp()
        driver_data = cls.get_drivers(1, cls.download_dir)
        cls.driver = driver_data["drivers"][0]
        cls.client = driver_data["clients"][0]
        cls.driver.implicitly_wait(driver_data["wait_time"])
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        os.rmdir(cls.download_dir)
        super().tearDownClass()

    def setUp(self):
        self.base_url = self.live_server_url
        self.verificationErrors = []
        self.accept_next_alert = True
        self.user = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter1"
        )
        self.login_user(self.user, self.driver, self.client)

    def test_overview(self):
        driver = self.driver
        driver.get(self.base_url + "/bibliography/")
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
        ).send_keys("Fish")
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
        ).send_keys("Table")
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
        ).send_keys("Jungle")
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Edit Categories'])[1]/following::button[2]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'All categories'])[1]/following::button[1]",
        ).click()
        try:
            self.assertEqual(
                "Fish",
                driver.find_element(By.ID, "categoryTitle_1").get_attribute(
                    "value"
                ),
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        try:
            self.assertEqual(
                "Table",
                driver.find_element(By.ID, "categoryTitle_2").get_attribute(
                    "value"
                ),
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        driver.find_element(
            By.CSS_SELECTOR,
            "button.fw-dark",
        ).click()
        driver.find_element(
            By.CSS_SELECTOR,
            "button[title='Register new source (Alt-n)']",
        ).click()
        driver.find_element(By.ID, "select-bibtype").click()
        driver.find_element(
            By.CSS_SELECTOR, "#select-bibtype option[value=article]"
        ).click()
        title_of_publication = driver.find_element(
            By.CSS_SELECTOR, ".journaltitle .ProseMirror"
        )
        title_of_publication.click()
        title_of_publication.send_keys("Title of publication")
        title = driver.find_element(By.CSS_SELECTOR, ".title .ProseMirror")
        title.click()
        title.send_keys("The title")
        first_name = driver.find_element(
            By.CSS_SELECTOR, ".given .ProseMirror"
        )
        first_name.click()
        first_name.click()  # TODO: We should not need two clicks
        first_name.send_keys("Hans")
        last_name = driver.find_element(
            By.CSS_SELECTOR, ".family .ProseMirror"
        )
        last_name.click()
        last_name.send_keys("Hansen")
        date_field = driver.find_element(By.CSS_SELECTOR, "input.date")
        date_field.click()
        date_field.send_keys("1984")
        driver.find_element(By.LINK_TEXT, "Categories").click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Categories'])[2]/following::div[1]",
        ).click()
        driver.find_element(
            By.XPATH,
            "(.//*[normalize-space(text()) and normalize-space(.)="
            "'Table'])[1]/following::div[1]",
        ).click()
        try:
            self.assertEqual(
                "Jungle",
                driver.find_element(
                    By.XPATH,
                    "(.//*[normalize-space(text()) and normalize-space(.)="
                    "'Table'])[1]/following::div[1]",
                ).text,
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        # Make change to citation source
        driver.find_element(By.CSS_SELECTOR, ".edit-bib").click()
        date_input = driver.find_element(
            By.CSS_SELECTOR, ".entry-field.date input"
        )
        date_input.click()
        date_input.send_keys(Keys.BACKSPACE)
        date_input.send_keys("5")
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        # Closed citation dialog
        search_input = driver.find_element(
            By.CSS_SELECTOR,
            ".fw-overview-menu-item .fw-button input[type=search]",
        )
        search_input.click()
        search_input.send_keys("women")
        try:
            self.assertEqual(
                "No sources found",
                driver.find_element(
                    By.CSS_SELECTOR,
                    ".fw-data-table.fw-large.datatable-table td",
                ).text,
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        search_input.send_keys(Keys.BACKSPACE)
        try:
            self.assertEqual(
                "The title",
                driver.find_element(
                    By.CSS_SELECTOR, ".fw-data-table-title .edit-bib"
                ).text,
            )
        except AssertionError as e:
            self.verificationErrors.append(str(e))
        driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload BibTeX file (Alt-u)']"
        ).click()
        # bibliography path
        bib_path = os.path.join(
            settings.PROJECT_PATH,
            "bibliography/tests/uploads/bibliography.bib",
        )
        driver.find_element(By.ID, "bib-uploader").send_keys(bib_path)
        driver.find_element(By.CSS_SELECTOR, "button.submit-import").click()
        book_title_el = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".fw-data-table tr:nth-child(2) .edit-bib")
            )
        )
        self.assertEqual(
            "Lean UX: Applying lean principles to improve user experience",
            book_title_el.text,
        )

        # Export through dropdown menu
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td > label"
        ).click()
        driver.find_element(By.CSS_SELECTOR, ".dt-bulk-dropdown").click()
        driver.find_element(
            By.CSS_SELECTOR, "li.content-menu-item:nth-child(2)"
        ).click()
        time.sleep(1)
        assert os.path.isfile(
            os.path.join(self.download_dir, "bibliography.zip")
        )
        os.remove(os.path.join(self.download_dir, "bibliography.zip"))

        # Delete bib entry
        entries = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-data-table .edit-bib"
        )
        self.assertEqual(len(entries), 2)
        driver.find_element(By.CSS_SELECTOR, ".delete-bib").click()
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.staleness_of(entries[0])
        )
        entries = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-data-table .edit-bib"
        )
        self.assertEqual(len(entries), 1)

        # Delete through dropdown menu
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td > label"
        ).click()
        driver.find_element(By.CSS_SELECTOR, ".dt-bulk-dropdown").click()
        driver.find_element(
            By.CSS_SELECTOR, "li.content-menu-item:nth-child(1)"
        ).click()
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.staleness_of(entries[0])
        )
        entries = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-data-table .edit-bib"
        )
        self.assertEqual(len(entries), 0)
        # Delete category
        driver.find_element(
            By.CSS_SELECTOR, "button[title='Edit categories (Alt-e)']"
        ).click()
        category_inputs = self.driver.find_elements(
            By.CSS_SELECTOR, "#editCategoryList tr"
        )
        self.assertEqual(len(category_inputs), 4)
        driver.find_element(
            By.CSS_SELECTOR, ".fw-add-input.icon-addremove"
        ).click()
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        driver.find_element(
            By.CSS_SELECTOR, "button[title='Edit categories (Alt-e)']"
        ).click()
        category_inputs = self.driver.find_elements(
            By.CSS_SELECTOR, "#editCategoryList tr"
        )
        self.assertEqual(len(category_inputs), 3)

    def tearDown(self):
        self.assertEqual([], self.verificationErrors)
        return super().tearDown()
