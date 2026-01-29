import os
import time
from tempfile import mkdtemp

from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from django.conf import settings


class ExportTest(SeleniumHelper, ChannelsLiveServerTestCase):
    """Test whether Fidus Writer exports files in all the formats.
    Note that it does not validate the export files."""

    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
    ]

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
        self.user1 = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter"
        )

    def test_export(self):
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        # Set copyright
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "#header-navigation > div.header-menu:nth-child(3) > span.header-nav-item",
                )
            )
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "#header-navigation > div:nth-child(3) > "
                "div > ul > li:nth-child(6) > span"
            ),
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".holder").send_keys(
            "The Big Company"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".year").send_keys("2003")
        self.driver.find_element(By.CSS_SELECTOR, ".license").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".license > option:nth-child(4)"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".license-start").send_keys(
            "2001-04-06"
        )
        self.driver.find_element(
            By.CSS_SELECTOR,
            "[aria-describedby=configure-copyright] button.fw-dark",
        ).click()

        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Title"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "No styling"
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "strong"
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Emphasis]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "emph"
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Emphasis]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.ENTER
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fa-list-ol").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "ordered list"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.ENTER
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fa-list-ul").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "bullet list"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.ENTER
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.ENTER
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Blockquote]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "block quote"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.ENTER
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fa-link").click()
        self.driver.find_element(By.CSS_SELECTOR, ".link-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".link-title").send_keys(
            "Sports"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".link").click()
        self.driver.find_element(By.CSS_SELECTOR, ".link").send_keys(
            "https://www.sports.com"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        self.driver.find_element(By.CSS_SELECTOR, ".fa-asterisk").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".footnote-container > p"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".footnote-container > p"
        ).send_keys("A footnote")
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".fa-book").click()
        # click on 'Register new source' button
        register_new_source = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CLASS_NAME, "register-new-bib-source")
            )
        )
        register_new_source.click()

        # select source
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "select-bibtype"))
        )

        # click on article
        Select(
            self.driver.find_element(By.ID, "select-bibtype")
        ).select_by_visible_text("Article")

        # fill the values
        title_of_publication = self.driver.find_element(
            By.CSS_SELECTOR, ".journaltitle .ProseMirror"
        )
        title_of_publication.click()
        title_of_publication.send_keys("My publication title")

        title = self.driver.find_element(
            By.CSS_SELECTOR, ".title .ProseMirror"
        )
        title.click()
        title.send_keys("My title")

        author_firstName = self.driver.find_element(
            By.CSS_SELECTOR, ".author .given .ProseMirror"
        )
        author_firstName.click()
        author_firstName.send_keys("John")

        author_lastName = self.driver.find_element(
            By.CSS_SELECTOR, ".family .ProseMirror"
        )
        author_lastName.click()
        author_lastName.send_keys("Doe")

        publication_date = self.driver.find_element(
            By.CSS_SELECTOR, ".date .date"
        )
        publication_date.click()
        publication_date.send_keys("2012")

        # click on Submit button
        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "ui-button") and normalize-space()="Submit"]',
        ).click()

        # Wait for source to be listed
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    "#selected-cite-source-table .selected-source",
                )
            )
        )
        # click on Insert button
        self.driver.find_element(By.CSS_SELECTOR, ".insert-citation").click()
        self.driver.find_element(
            By.CSS_SELECTOR, 'button[title="Horizontal line"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            Keys.DOWN
        )
        # Insert figure
        button = self.driver.find_element(By.XPATH, '//*[@title="Figure"]')
        button.click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#figure-dialog span.math-field")
            )
        )

        time.sleep(1)  # Needed to ensure next lines work

        # click on 'Insert image' button
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Insert image"]')
            )
        ).click()

        upload_button = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Add new image"]')
            )
        )

        upload_button.click()

        # image path
        image_path = os.path.join(
            settings.PROJECT_PATH, "document/tests/uploads/image.png"
        )

        # in order to select the image we send the image path in the
        # LOCAL MACHINE to the input tag
        upload_image_url = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[@id="editimage"]/div[1]/input[2]')
            )
        )
        upload_image_url.send_keys(image_path)

        # click on 'Upload' button
        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "ui-button") and normalize-space()="Upload"]',
        ).click()

        # click on 'Use image' button
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".fw-data-table i.fa-check")
            )
        )

        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Use image"]'
        ).click()

        # Set copyright info
        self.driver.find_element(
            By.CSS_SELECTOR, "div.figure-preview > div > span > i"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "body > div.ui-content-menu.ui-corner-all.ui-widget."
                "ui-widget-content.ui-front > div > div > ul > li:nth-child(1)"
            ),
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".holder").send_keys(
            "Johannes Wilm"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".year").send_keys("1998")
        self.driver.find_element(By.CSS_SELECTOR, ".license").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".license > option:nth-child(2)"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".license-start").send_keys(
            "1998-04-23"
        )
        self.driver.find_element(
            By.CSS_SELECTOR,
            "[aria-describedby=configure-copyright] button.fw-dark",
        ).click()

        # click on 'Insert' button
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()

        caption = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "div.doc-body figure figcaption")
            )
        )
        caption.click()
        caption.send_keys("Figure")

        ActionChains(self.driver).send_keys(Keys.RIGHT).perform()
        # Add table
        self.driver.find_element(By.CSS_SELECTOR, ".fa-table").click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "table.insert-table-selection tr:nth-child(2) > td:nth-child(2)",
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(1) > p"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(1) > p"
        ).send_keys("one")
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(2) > p"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(2) > p"
        ).send_keys("two")
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(2) > td:nth-child(1) > p"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(2) > td:nth-child(1) > p"
        ).send_keys("three")
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(2) > td:nth-child(2)"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(2) > td:nth-child(2)"
        ).send_keys("four")
        # Add table caption
        self.driver.find_element(
            By.CSS_SELECTOR, "div.table-100 > button"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "body > div.ui-content-menu > div > div > ul > li:nth-child(16)",
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "div.table-category").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Table"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "div.table-caption").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Enable"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        caption = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "div.doc-body table caption")
            )
        )

        caption.click()

        caption.send_keys("Table Caption")
        # Document with many features has been created let's see if we can
        # export it from the editor.

        # HTML
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="HTML"]'
        ).click()
        path = os.path.join(self.download_dir, "title.html.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # EPUB
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Epub"]'
        ).click()
        path = os.path.join(self.download_dir, "title.epub")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # LaTeX
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="LaTeX"]'
        ).click()
        path = os.path.join(self.download_dir, "title.latex.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # JATS
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="JATS"]'
        ).click()
        path = os.path.join(self.download_dir, "title.jats.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # DOCX
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Classic (DOCX)"]'
        ).click()
        path = os.path.join(self.download_dir, "title.docx")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # ODT
        self.driver.find_element(
            By.CSS_SELECTOR,
            '.header-nav-item[title="Export of the document contents"]',
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Free (ODT)"]'
        ).click()
        path = os.path.join(self.download_dir, "title.odt")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # Save a revision
        self.driver.find_element(
            By.CSS_SELECTOR, '.header-nav-item[title="File handling"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Save revision"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".revision-note").send_keys(
            "First revision"
        )
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Save"]'
        ).click()
        # Wait for revision save to be done
        WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-success"))
        )
        # Exit the editor
        self.driver.find_element(By.ID, "close-document-top").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        )

        # Export from overview
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td > label"
        ).click()

        # Native
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as FIDUS"]'
        ).click()
        path = os.path.join(self.download_dir, "title.fidus")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # Slim native
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as Slim FIDUS"]'
        ).click()
        path = os.path.join(self.download_dir, "title.fidus")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        # We keep the file for the upload test below
        upload_slim_path = os.path.join(self.download_dir, "upload_slim.fidus")
        os.rename(path, upload_slim_path)

        # EPUB
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as Epub"]'
        ).click()
        path = os.path.join(self.download_dir, "title.epub")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # HTML
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as HTML"]'
        ).click()
        path = os.path.join(self.download_dir, "title.html.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # LaTeX
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as LaTeX"]'
        ).click()
        path = os.path.join(self.download_dir, "title.latex.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # JATS
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Export selected as JATS"]'
        ).click()
        path = os.path.join(self.download_dir, "title.jats.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # Revision
        self.driver.find_element(By.CSS_SELECTOR, ".revisions").click()
        self.driver.find_element(By.CSS_SELECTOR, ".download-revision").click()
        path = os.path.join(self.download_dir, "title.fidus")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        upload_full_path = os.path.join(self.download_dir, "upload_full.fidus")
        os.rename(path, upload_full_path)
        # We keep the file to test import below
        self.driver.find_element(By.CSS_SELECTOR, ".recreate-revision").click()
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, "#revisions-dialog > table > tbody tr"
                )
            ),
            1,
        )
        self.driver.find_element(By.CSS_SELECTOR, ".delete-revision").click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, "#revisions-dialog > table > tbody tr"
                )
            ),
            0,
        )
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-orange").click()

        # Delete document
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 2)
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) > td > label"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".dt-bulk-dropdown"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Delete selected"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 1)
        self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr .delete-document"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 0)
        # We delete the image so our import will cause an image import
        self.driver.find_element(
            By.CSS_SELECTOR, "a[href='/usermedia/']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".delete-image").click()
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        # We import the fidus file
        self.driver.find_element(By.CSS_SELECTOR, "a[href='/']").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload FIDUS document (Alt-u)']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#fidus-uploader").send_keys(
            upload_full_path
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 1)
        # We delete our downloaded fidus file
        os.remove(upload_full_path)
        # Upload slim file
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title='Upload FIDUS document (Alt-u)']"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#fidus-uploader").send_keys(
            upload_slim_path
        )
        self.driver.find_element(By.CSS_SELECTOR, ".fw-dark").click()
        time.sleep(1)
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )
        self.assertEqual(len(documents), 2)
        # We delete our downloaded fidus file
        os.remove(upload_slim_path)
