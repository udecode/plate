import time

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper


class ContactsTest(SeleniumHelper, ChannelsLiveServerTestCase):
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
        self.user = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="password"
        )
        self.contact1 = self.create_user(
            username="Contact1",
            email="contact1@snowman.com",
            passtext="password",
        )
        self.contact2 = self.create_user(
            username="Contact2",
            email="contact2@snowman.com",
            passtext="password",
        )
        self.login_user(self.user, self.driver, self.client)

    def test_contacts(self):
        self.driver.get(self.base_url + "/")
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        # Open share dialog
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(1) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(1) > .fw-pulldown-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-add-button"
        ).click()
        self.driver.find_element(By.ID, "new-contact-user-string").click()
        self.driver.find_element(By.ID, "new-contact-user-string").send_keys(
            "contact1@snowman.com"
        )
        ActionChains(self.driver).send_keys(Keys.TAB).send_keys(
            Keys.RETURN
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        # Close document
        self.driver.find_element(By.ID, "close-document-top").click()
        # Enter contacts page
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Contacts"]'
        ).click()
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select"
                )
            ),
            1,
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Invite contact (Alt-i)']"
        ).click()
        self.driver.find_element(By.ID, "new-contact-user-string").send_keys(
            "contact2@snowman.com"
        )
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select"
                )
            ),
            2,
        )
        # Delete individual
        self.driver.find_element(
            By.CSS_SELECTOR, ".delete-single-contact"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select"
                )
            ),
            1,
        )
        self.driver.find_element(
            By.CSS_SELECTOR, ".contacts-table td:nth-child(1) > label"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".dt-bulk-dropdown").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li[title='Delete selected contacts.']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select"
                )
            ),
            0,
        )
