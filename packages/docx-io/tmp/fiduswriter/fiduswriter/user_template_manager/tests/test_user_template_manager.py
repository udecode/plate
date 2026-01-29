import time
import os
from tempfile import mkdtemp

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper


class UserTemplateManagerTest(SeleniumHelper, ChannelsLiveServerTestCase):
    fixtures = ["initial_documenttemplates.json", "initial_styles.json"]

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
        self.user = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter1"
        )
        self.login_user(self.user, self.driver, self.client)

    def test_template_export_import(self):
        driver = self.driver
        driver.get(f"{self.base_url}/templates/")
        templates = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .far.fa-file"
        )
        self.assertEqual(len(templates), 1)
        editable_templates = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .fw-data-table-title a"
        )
        self.assertEqual(len(editable_templates), 0)
        self.driver.find_element(
            By.CSS_SELECTOR, ".entry-select + label"
        ).click()
        # Try to delete the default template - should fail
        self.driver.find_element(By.CSS_SELECTOR, ".dt-bulk-dropdown").click()
        self.driver.find_element(
            By.CSS_SELECTOR, 'li.content-menu-item[data-index="0"]'
        ).click()
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-error"))
        )
        self.assertEqual(alert_element.is_displayed(), True)
        # Duplicate default template
        self.driver.find_element(By.CSS_SELECTOR, ".dt-bulk-dropdown").click()
        self.driver.find_element(
            By.CSS_SELECTOR, 'li.content-menu-item[data-index="1"]'
        ).click()
        time.sleep(1)
        editable_templates = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .fw-data-table-title a"
        )
        self.assertEqual(len(editable_templates), 1)
        # Enter copied template and modify title
        editable_templates[0].click()
        title_field = self.driver.find_element(By.CSS_SELECTOR, "input.title")
        title_field.send_keys(" COPY")
        import_id_field = self.driver.find_element(
            By.CSS_SELECTOR, "input.import-id"
        )
        import_id_field.send_keys("-1")
        self.driver.find_element(By.CSS_SELECTOR, "button.save").click()
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-info"))
        )
        self.assertEqual(alert_element.is_displayed(), True)
        self.driver.refresh()
        # Download the file
        self.driver.find_element(By.CSS_SELECTOR, "button.download").click()
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-info"))
        )
        self.assertEqual(alert_element.is_displayed(), True)
        time.sleep(1)
        file_path = os.path.join(
            self.download_dir, "copy-of-standard-article-copy.fidustemplate"
        )
        self.wait_until_file_exists(file_path, self.wait_time)
        assert os.path.isfile(file_path)
        self.driver.refresh()
        self.driver.find_element(By.CSS_SELECTOR, "button.close").click()
        time.sleep(1)
        upload_button = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    '//*[normalize-space()="Upload FIDUSTEMPLATE file"]',
                )
            )
        )
        upload_button.click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#fidus-template-uploader"
        ).send_keys(file_path)
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Import"]'
        ).click()
        time.sleep(1)
        editable_templates = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .fw-data-table-title a"
        )
        self.assertEqual(len(editable_templates), 2)
        os.remove(file_path)
        editable_templates[1].click()
        export_template_buttons = self.driver.find_elements(
            By.CSS_SELECTOR, ".export-templates button"
        )
        self.assertEqual(len(export_template_buttons), 3)
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Close"]'
        ).click()
        # Create file based on copied template
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li.new_document .dropdown"
        ).click()
        self.driver.find_elements(By.CSS_SELECTOR, ".fw-pulldown-item")[
            1
        ].click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Article"
        )
        time.sleep(1)
        # Export full
        self.driver.find_element(
            By.CSS_SELECTOR, '.header-nav-item[title="File handling"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Download"]'
        ).click()
        path = os.path.join(self.download_dir, "article.fidus")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        fat_file_path = os.path.join(self.download_dir, "fat.fidus")
        os.rename(path, fat_file_path)
        # Export slim
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Slim FIDUS"]'
        ).click()
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        slim_file_path = os.path.join(self.download_dir, "slim.fidus")
        os.rename(path, slim_file_path)
        # Exit editor
        self.driver.find_element(By.ID, "close-document-top").click()
        # Delete document
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".delete-document"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-success"))
        )
        self.assertEqual(alert_element.is_displayed(), True)
        # Delete templates
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Templates"]'
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".delete-doc-template"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        time.sleep(1)
        self.driver.find_element(
            By.CSS_SELECTOR, ".delete-doc-template"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        time.sleep(1)
        # Import slim document
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload FIDUS document (Alt-u)']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#fidus-uploader").send_keys(
            slim_file_path
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        # Delete document
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".delete-document"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-success"))
        )
        self.assertEqual(alert_element.is_displayed(), True)
        # Check that document template has no export templates
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Templates"]'
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".fw-data-table-title"
        ).click()
        export_template_buttons = self.driver.find_elements(
            By.CSS_SELECTOR, ".export-templates button"
        )
        self.assertEqual(len(export_template_buttons), 1)
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Close"]'
        ).click()
        # Delete template
        self.driver.find_element(
            By.CSS_SELECTOR, ".delete-doc-template"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete"]'
        ).click()
        # Import fat file
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload FIDUS document (Alt-u)']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#fidus-uploader").send_keys(
            fat_file_path
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        # Import slim file
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload FIDUS document (Alt-u)']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#fidus-uploader").send_keys(
            slim_file_path
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        time.sleep(1)
        # Check number of documents
        delete_links = self.driver.find_elements(
            By.CSS_SELECTOR, ".delete-document"
        )
        self.assertEqual(len(delete_links), 2)
        # Check number of templates
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Templates"]'
        ).click()
        template_links = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-data-table-title a"
        )
        self.assertEqual(len(template_links), 1)
        # Check export templates in template
        template_links[0].click()
        export_template_buttons = self.driver.find_elements(
            By.CSS_SELECTOR, ".export-templates button"
        )
        self.assertEqual(len(export_template_buttons), 3)
        os.remove(slim_file_path)
        os.remove(fat_file_path)
