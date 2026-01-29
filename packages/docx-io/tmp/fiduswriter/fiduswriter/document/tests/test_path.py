import time
from urllib.parse import urlparse

from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class PathTest(SeleniumHelper, ChannelsLiveServerTestCase):
    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
    ]

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
        self.user1 = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter"
        )

    def test_move_document(self):
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        # Enter editor
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Test"
        )
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "#document-title").text,
            "Test",
        )
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").click()
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").click()
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").send_keys(
            Keys.CONTROL, "a"
        )
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").send_keys(
            "/Reports/2019/Report 23"
        )
        # Exit to overview page
        self.driver.find_element(
            By.CSS_SELECTOR, "#close-document-top"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        )
        self.assertEqual(
            urlparse(self.driver.current_url).path, "/documents/Reports/2019/"
        )
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, ".fw-contents h1").text,
            "/Reports/2019/",
        )
        # Create new folder 'February' and enter
        self.driver.find_element(
            By.CSS_SELECTOR, 'button[title="Create new folder (Alt-f)"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#new-folder-name").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#new-folder-name"
        ).send_keys("February")
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        # Enter editor
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "February Doc"
        )
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "#document-title").text,
            "/Reports/2019/February/February Doc",
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "February Doc Content"
        )
        # Exit to overview page
        self.driver.find_element(
            By.CSS_SELECTOR, "#close-document-top"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        )
        self.assertEqual(
            urlparse(self.driver.current_url).path,
            "/documents/Reports/2019/February/",
        )
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            >= 2
        )
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 2)
        self.assertEqual(documents[0].text, "..")
        self.assertEqual(documents[1].text, "February Doc")
        # Go up one folder
        documents[0].click()
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: urlparse(driver.current_url).path
            == "/documents/Reports/2019/"
        )
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 3)
        self.assertEqual(documents[0].text, "..")
        self.assertEqual(documents[1].text, "February")
        self.assertEqual(documents[2].text, "Report 23")
        # Move initial document via overview page
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(3) > td > label"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Move selected"]'
        ).click()
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(
                By.CSS_SELECTOR, 'input[placeholder="Insert path"]'
            ).get_attribute("value"),
            "/Reports/2019/Report 23",
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "#move-dialog i.fa-plus-square"
        ).click()
        time.sleep(1)
        self.driver.find_element(
            By.CSS_SELECTOR, "#move-dialog i.fa-plus-square"
        ).click()
        february_folder = self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "#move-dialog .file-selector .folder-content .folder-content "
                ".folder-content .folder-name"
            ),
        )
        self.assertEqual(february_folder.text.strip(), "February")
        february_folder.click()
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(
                By.CSS_SELECTOR, 'input[placeholder="Insert path"]'
            ).get_attribute("value"),
            "/Reports/2019/February/Report 23",
        )
        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "fw-dark") and normalize-space()="Submit"]',
        ).click()
        time.sleep(1)
        # Document should be gone as it is moved into the February subfolder
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 2)
        self.assertEqual(documents[0].text, "..")
        self.assertEqual(documents[1].text, "February")
        # We enter the February folder. There should be two files now
        documents[1].click()
        time.sleep(1)
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 3)
        self.assertEqual(documents[0].text, "..")
        self.assertEqual(documents[1].text, "Report 23")
        self.assertEqual(documents[2].text, "February Doc")
        # Move both docs to a new folder
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(2) > td > label"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(3) > td > label"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Move selected"]'
        ).click()
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(
                By.CSS_SELECTOR, 'input[placeholder="Insert path"]'
            ).get_attribute("value"),
            "/Reports/2019/February/",
        )
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="New folder"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#new-folder-name").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#new-folder-name"
        ).send_keys("Documents")
        self.driver.find_element(
            By.XPATH,
            (
                '//*[contains(@class, "fw-dark") and '
                'normalize-space()="Create folder"]'
            ),
        ).click()
        time.sleep(1)
        self.assertEqual(
            self.driver.find_element(
                By.CSS_SELECTOR, 'input[placeholder="Insert path"]'
            ).get_attribute("value"),
            "/Documents/",
        )
        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "fw-dark") and normalize-space()="Submit"]',
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            == 1
        )
        # Documents should be gone as it is moved into the February subfolder
        document = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(document.text, "..")
        document.click()
        # Confirm deletion
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button.delete-folder")
            )
        ).click()
        # Also the 2019 folder should be empty
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            == 1
        )
        document = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(document.text, "..")
        document.click()
        # Confirm deletion
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button.delete-folder")
            )
        ).click()
        # Also the Reports folder should be empty
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            == 1
        )
        document = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(document.text, "..")
        document.click()
        # Confirm deletion
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button.delete-folder")
            )
        ).click()
        # There should be just one folder in the top folder.
        # The Reports folder should have been auto-deleted.
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            == 1
        )
        document = self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(document.text, "Documents")
        document.click()
        # There should be two docs in the Documents folder
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: len(
                driver.find_elements(
                    By.CSS_SELECTOR,
                    ".fw-contents tbody tr a.fw-data-table-title",
                )
            )
            == 3
        )
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(documents[1].text, "Report 23")
        self.assertEqual(documents[2].text, "February Doc")
