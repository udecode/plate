import time
import sys
import multiprocessing
from tempfile import mkdtemp

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from testing.channels_patch import ChannelsLiveServerTestCase
from .editor_helper import EditorHelper
from document.consumers import WebsocketConsumer
from django.conf import settings
import os
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from document.models import AccessRight


class OfflineTests(EditorHelper, ChannelsLiveServerTestCase):
    """
    Tests in which two browsers collaborate and the connection is interrupted.
    """

    user = None
    TEST_TEXT = "Lorem ipsum dolor sit amet."
    MULTILINE_TEST_TEXT = "Lorem ipsum\ndolor sit amet."
    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
    ]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        driver_data = cls.get_drivers(2)
        cls.driver = driver_data["drivers"][0]
        cls.driver2 = driver_data["drivers"][1]
        cls.client = driver_data["clients"][0]
        cls.client2 = driver_data["clients"][1]
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.driver2.quit()
        super().tearDownClass()

    def setUp(self):
        self.user = self.create_user()
        self.login_user(self.user, self.driver, self.client)
        self.login_user(self.user, self.driver2, self.client2)
        self.doc = self.create_new_document(self.user)
        super().setUp()

    def tearDown(self):
        super().tearDown()
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 2)

    def test_simple(self):
        """
        Test one client going offline in collaborative mode while both clients
        continue to write and whether documents are synched when user returns
        online.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

    def test_too_many_diffs(self):
        """
        Test one client going offline in collaborative mode while both clients
        continue to write with the connected clients adding too many items to
        the history so that the server no longer can provide it with all
        missing steps. The client therefore needs to recreate the missing steps
        by itself.
        """

        # The history length stored by the server is shortened from 1000 to 1.
        WebsocketConsumer.history_length = 1

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

        WebsocketConsumer.history_length = 1000

    def test_tracking_local_changes(self):
        """
        Test one client going offline in collaborative mode while both clients
        continue to write with the disconnected clients adding enough items to
        the history so that tracking kicks in. The limit of steps is set so
        that tracking kicks in.
        """

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 sets local tracking limit that will be reached
        self.driver2.execute_script(
            "window.theApp.page.mod.collab.doc.merge.trackOfflineLimit = 0"
        )
        # driver 2 sets remote tracking limit that will not be reached
        self.driver2.execute_script(
            "window.theApp.page.mod.collab.doc.merge."
            "remoteTrackOfflineLimit = 10000"
        )

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

        dialogtitle = WebDriverWait(self.driver2, self.wait_time).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "ui-dialog-title"))
        )

        assert dialogtitle.text == "System message"
        self.driver2.find_element(
            By.CSS_SELECTOR, ".ui-dialog button.fw-orange.fw-button"
        ).click()

        change_tracking_boxes = self.driver2.find_elements(
            By.CSS_SELECTOR, ".margin-box.track"
        )
        self.assertEqual(len(change_tracking_boxes), 1)

    def test_tracking_remote_changes(self):
        """
        Test one client going offline in collaborative mode while both clients
        continue to write with the connected clients adding enough items to
        the history so that tracking kicks in. The limit of steps is set so
        that tracking kicks in.
        """

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 sets remote tracking limit that will be reached
        self.driver2.execute_script(
            "window.theApp.page.mod.collab.doc.merge."
            "remoteTrackOfflineLimit = 0"
        )
        # driver 2 sets local tracking limit that will not be reached
        self.driver2.execute_script(
            "window.theApp.page.mod.collab.doc.merge.trackOfflineLimit = 10000"
        )

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

        dialogtitle = WebDriverWait(self.driver2, self.wait_time).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "ui-dialog-title"))
        )

        assert dialogtitle.text == "System message"
        self.driver2.find_element(
            By.CSS_SELECTOR, ".ui-dialog button.fw-orange.fw-button"
        ).click()

        change_tracking_boxes = self.driver2.find_elements(
            By.CSS_SELECTOR, ".margin-box.track"
        )
        self.assertEqual(len(change_tracking_boxes), 1)

    def test_too_many_diffs_with_tracking(self):
        """
        Test one client going offline in collaborative mode while both clients
        continue to write with the connected clients adding too many items to
        the history so that the server no longer can provide it with all
        missing steps. The client therefore needs to recreate the missing steps
        by itself. The limit of steps is set so that tracking kicks in.
        """

        # The history length stored by the server is shortened from 1000 to 1.
        WebsocketConsumer.history_length = 1

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 sets tracking limit
        self.driver2.execute_script(
            "window.theApp.page.mod.collab.doc.merge.trackOfflineLimit = 0"
        )

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

        dialogtitle = WebDriverWait(self.driver2, self.wait_time).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "ui-dialog-title"))
        )

        assert dialogtitle.text == "System message"
        self.driver2.find_element(
            By.CSS_SELECTOR, ".ui-dialog button.fw-orange.fw-button"
        ).click()

        change_tracking_boxes = self.driver2.find_elements(
            By.CSS_SELECTOR, ".margin-box.track"
        )
        self.assertEqual(len(change_tracking_boxes), 1)

        WebsocketConsumer.history_length = 1000

    def test_failed_authentication(self):
        """
        Test One Client Going offline, while the other client is still
        editing the document. The client that goes offline has its
        session expired, while it is offline.
        When it comes back online, the user sees a dialog explaining the
        situation and the offline version of the document is downloaded.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # Clear cookie before coming back online
        self.driver2.delete_cookie(settings.SESSION_COOKIE_NAME)

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        # Check that session expiration dialog is displayed
        element = WebDriverWait(self.driver2, self.wait_time).until(
            EC.visibility_of_element_located(
                (By.ID, "session_expiration_dialog")
            )
        )
        self.assertEqual(element.is_displayed(), True)

    def test_conflicting_changes(self):
        """
        Test one client going offline, while the other client is still
        editing the document. The client that is offline adds
        content to a paragraph. This paragraph is deleted by the online user.
        Because of this conflict, the merge window opens up.
        """
        # The history length stored by the server is shortened from 1000 to 1.
        WebsocketConsumer.history_length = 1

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Start writing text in the middle to cause conflict
        # when online user deletes data.
        self.driver2.execute_script("window.testCaret.setSelection(27,27)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # Delete all the content from client 1 to cause conflict.
        for i in range(0, len(self.TEST_TEXT)):
            actions = ActionChains(self.driver)
            actions.send_keys(Keys.BACKSPACE)
            actions.perform()

        # Driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        # Check whether the merge window is available in driver2
        element = WebDriverWait(self.driver2, self.wait_time).until(
            EC.visibility_of_element_located((By.ID, "editor-merge-view"))
        )
        self.assertEqual(element.is_displayed(), True)
        # Check that the documents in main editors are synced!
        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

        # Change the websocket history length back to its original value
        WebsocketConsumer.history_length = 1000


class FunctionalOfflineTests(EditorHelper, ChannelsLiveServerTestCase):
    """
    Tests in which one user works offline. The Service Worker is
    also installed in these tests.
    """

    user = None
    TEST_TEXT = "Lorem ipsum dolor sit amet."
    MULTILINE_TEST_TEXT = "Lorem ipsum\ndolor sit amet."
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
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        super().tearDownClass()

    def setUp(self):
        self.user = self.create_user()
        self.login_user(self.user, self.driver, self.client)
        self.driver.execute_script("window.theApp.installServiceWorker()")
        self.doc = self.create_new_document(self.user)

    def tearDown(self):
        super().tearDown()
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 3)

    def test_service_workers(self):
        """
        Test one client going offline after writing some text and inserting
        some images. While offline client tries to export to HTML
        and print the PDF of the document.
        """
        self.load_document_editor(self.driver, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        self.type_text(self.driver, self.TEST_TEXT)

        # We add a figure
        button = self.driver.find_element(By.XPATH, '//*[@title="Figure"]')
        button.click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "span.math-field")
            )
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "div.figure-category"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Photo"]'
        ).click()

        # click on 'Insert image' button
        self.driver.find_element(By.ID, "insert-figure-image").click()

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
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()

        caption = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "div.doc-body figure figcaption")
            )
        )

        caption.click()

        caption.send_keys("Caption")

        ActionChains(self.driver).send_keys(Keys.RIGHT).perform()

        # driver goes offline
        self.driver.execute_script("window.theApp.page.ws.goOffline()")

        # Check that the html export works fine!
        # Click on the menu
        self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export of the document contents')]",
        ).click()

        # Click on the HTML export
        self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export the document to an HTML file.')]",
        ).click()

        # Check that the file has downloaded.
        path = os.path.join(self.download_dir, "my-title.html.zip")
        self.wait_until_file_exists(path, self.wait_time)
        assert os.path.isfile(path)
        os.remove(path)

        # Check the same for PDF export too !
        # Click on the file menu
        self.driver.find_element(
            By.XPATH, "//span[contains(@title,'File handling')]"
        ).click()
        time.sleep(1)

        # Click on the Print PDF button
        self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Either print or"
            + " create a PDF using your browser print dialog.')]",
        ).click()

        # Check that the alert box is displayed.
        alert_element = WebDriverWait(self.driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-info"))
        )
        self.assertEqual(alert_element.is_displayed(), True)

    def test_disabled_options(self):
        """
        Test one user going offline after writing some text.
        While the user is offline, he tries different export
        options which are disabled. He wants to upload an image,
        but the button is gone.
        """
        self.load_document_editor(self.driver, self.doc)
        self.add_title(self.driver)

        # driver goes offline
        self.driver.execute_script("window.theApp.page.ws.goOffline()")
        self.driver.execute_script("window.theApp.ws.goOffline()")

        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        # Type some text
        self.type_text(self.driver, self.TEST_TEXT)

        # Check the share and create revision buttons are disabled.
        file_menu = self.driver.find_element(
            By.XPATH, "//span[contains(@title,'File handling')]"
        )
        file_menu.click()
        time.sleep(1)

        share_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Share the document with other users.')]",
        )
        share_button_classes = share_button.get_attribute("class").split(" ")
        self.assertEqual("disabled" in share_button_classes, True)

        save_revision_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Save a revision of " + "the document.')]",
        )
        save_revision_button_classes = save_revision_button.get_attribute(
            "class"
        ).split(" ")
        self.assertEqual("disabled" in save_revision_button_classes, True)

        # Check that the EPUB, LaTex and JATS exports are disabled
        # when user is offline.
        export_menu = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export of the document contents')]",
        )
        export_menu.click()

        epub_export_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export the document to "
            + "an Epub electronic reader file.')]",
        )
        epub_export_button_classes = epub_export_button.get_attribute(
            "class"
        ).split(" ")
        self.assertEqual("disabled" in epub_export_button_classes, True)

        latex_export_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export the document to an LaTeX file.')]",
        )
        latex_export_button_classes = latex_export_button.get_attribute(
            "class"
        ).split(" ")
        self.assertEqual("disabled" in latex_export_button_classes, True)

        jats_export_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Export the document to a Journal "
            + "Archiving and Interchange Tag Library NISO JATS Version 1.2 "
            + "file.')]",
        )
        jats_export_button_classes = jats_export_button.get_attribute(
            "class"
        ).split(" ")
        self.assertEqual("disabled" in jats_export_button_classes, True)

        # Check that the Switching between styles is disabled.
        settings_menu = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Configure settings of this document.')]",
        )
        settings_menu.click()

        doc_style_button = self.driver.find_element(
            By.XPATH,
            "//span[contains(@title,'Choose your preferred document style.')]",
        )
        doc_style_button_classes = doc_style_button.get_attribute(
            "class"
        ).split(" ")
        self.assertEqual("disabled" in doc_style_button_classes, True)

        # Try to upload a figure
        button = self.driver.find_element(By.XPATH, '//*[@title="Figure"]')
        button.click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "span.math-field")
            )
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "div.figure-category"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Photo"]'
        ).click()

        # click on 'Insert image' button
        self.driver.find_element(By.ID, "insert-figure-image").click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Use image"]')
            )
        )

        upload_buttons = self.driver.find_elements(
            By.XPATH, '//*[normalize-space()="Add new image"]'
        )
        self.assertEqual(len(upload_buttons), 0)

        # Come back online to prevent pop up from showing up.
        self.driver.execute_script("window.theApp.page.ws.goOnline()")
        self.driver.execute_script("window.theApp.ws.goOnline()")
        WebDriverWait(self.driver, self.wait_time).until(
            lambda driver: driver.execute_script(
                "return window.theApp.ws.connected"
            )
        )

    def test_indexedDB(self):
        """
        Testing a user going offline after logging in.
        Test that the documents overview page is
        rendered from indexed DB when the user is
        offline.
        """
        # Load the documents overview page
        self.driver.get(self.live_server_url)

        # Go offline
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "fw-contents"))
        )
        self.driver.execute_script("window.theApp.ws.goOffline()")

        # Click the documents overview page button to see
        # if it's loaded from indexed DB
        doc_overview_menu = self.driver.find_element(
            By.XPATH, "//a[contains(@title,'edit documents')]"
        )
        doc_overview_menu.click()

        # Check the document table is rendered even when offline!
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "fw-contents"))
        )
        doc_row = self.driver.find_element(
            By.XPATH, f"//a[@href='/document/{self.doc.id}']"
        )
        self.assertEqual(doc_row.is_displayed(), True)

        # Check that the alert regarding offline is shown.
        alert_element = self.driver.find_element(By.CLASS_NAME, "alerts-info")
        self.assertEqual(alert_element.is_displayed(), True)


class AccessRightsOfflineTests(EditorHelper, ChannelsLiveServerTestCase):
    """
    Tests in which one user works offline. During which the
    access rights of the user has been modified/deleted.
    """

    user = None
    TEST_TEXT = "Lorem ipsum dolor sit amet."
    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
    ]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.download_dir = mkdtemp()
        driver_data = cls.get_drivers(2, cls.download_dir)
        cls.driver = driver_data["drivers"][0]
        cls.driver2 = driver_data["drivers"][1]
        cls.client = driver_data["clients"][0]
        cls.client2 = driver_data["clients"][1]
        cls.wait_time = driver_data["wait_time"]

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.driver2.quit()
        super().tearDownClass()

    def setUp(self):
        super().setUp()
        self.user = self.create_user()
        self.user2 = self.create_user(
            username="UserB", email="testB@example.com"
        )
        self.login_user(self.user, self.driver, self.client)
        self.login_user(self.user2, self.driver2, self.client2)
        self.doc = self.create_new_document(self.user)
        # Since the test uses 2 different users ,
        # add access rights for the 2nd user.
        AccessRight.objects.create(
            holder_obj=self.user2, document=self.doc, rights="write"
        )

    def tearDown(self):
        super().tearDown()
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 3)

    def get_title(self, driver):
        # Title is child 0.
        return driver.execute_script(
            "return window.theApp.page.view.state.doc.firstChild.textContent;"
        )

    def test_access_rights_deletion(self):
        """
        Test One Client Going offline, while the other client is still
        editing the document. The client that goes offline has their
        access rights removed, while it is offline.
        When it comes back online, the user sees a dialog explaining the
        situation and the offline version of the document is downloaded.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # Delete access rights of the user before coming back online
        AccessRight.objects.filter(user=self.user2, document=self.doc).delete()

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        # Check that dialog is displayed
        element = WebDriverWait(self.driver2, self.wait_time).until(
            EC.visibility_of_element_located(
                (By.ID, "session_expiration_dialog")
            )
        )
        self.assertEqual(element.is_displayed(), True)

        # Click "Download Document" button
        download_button = self.driver2.find_element(
            By.XPATH, "//button[contains(text(), 'Download Document')]"
        )
        download_button.click()

        # Define the path where the file should be downloaded
        doc_title = self.get_title(self.driver2).lower().replace(" ", "-")
        path = os.path.join(self.download_dir, f"{doc_title}.fidus")

        # Wait for the file to download and check it exists
        self.wait_until_file_exists(path, self.wait_time)
        self.assertTrue(os.path.isfile(path))

        # Clean up - remove the downloaded file if it exists
        if os.path.exists(path):
            os.remove(path)

    def test_simple_access_rights_change(self):
        """
        Test One Client Going offline, while the other client is still
        editing the document. The client that goes offline has their
        access rights modified, while it is offline.
        When it comes back online, the user sees a alert
        explaining the access rights change and the document
        can be edited by it afterwards.
        """
        # Initialize user2 with read rights.
        AccessRight.objects.filter(user=self.user2, document=self.doc).update(
            rights="read"
        )

        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        # Add some test text
        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        self.type_text(self.driver, self.TEST_TEXT)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        # Modify access rights of the user before coming back online
        AccessRight.objects.filter(user=self.user2, document=self.doc).update(
            rights="write"
        )

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        # Check that the alert box is displayed.
        alert_element = WebDriverWait(self.driver2, self.wait_time).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "alerts-info"))
        )
        self.assertEqual(alert_element.is_displayed(), True)

        # Write some test text wuith user2
        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        self.driver2.execute_script("window.testCaret.setSelection(25,25)")
        self.type_text(self.driver2, self.TEST_TEXT)

        # Check that access rights is changed in front end
        access_rights = self.driver2.execute_script(
            "return window.theApp.page.docInfo.access_rights"
        )
        self.assertEqual(access_rights, "write")

        # Check that the entered text is present
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

    def test_access_rights_change_non_editable_rights(self):
        """
        Test One Client Going offline, while the other client is still
        editing the document. The client that goes offline has their
        access rights changed to read(non-editable right access rights),
        while it is offline. When it comes back online, the
        user sees a dialog explaining the situation and the
        offline version of the document is downloaded.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)
        self.driver.find_element(By.CLASS_NAME, "doc-body").click()

        p1 = multiprocessing.Process(
            target=self.type_text, args=(self.driver, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # driver 2 goes offline
        self.driver2.execute_script("window.theApp.page.ws.goOffline()")

        self.driver2.find_element(By.CLASS_NAME, "doc-body").click()

        # Total: 25
        self.driver2.execute_script("window.testCaret.setSelection(25,25)")

        p2 = multiprocessing.Process(
            target=self.type_text, args=(self.driver2, self.TEST_TEXT)
        )
        p2.start()
        p1.join()
        p2.join()

        # Modify access rights of the user to read before coming back online
        AccessRight.objects.filter(user=self.user2, document=self.doc).update(
            rights="read"
        )

        # driver 2 goes online
        self.driver2.execute_script("window.theApp.page.ws.goOnline()")

        # Check that dialog is displayed
        element = WebDriverWait(self.driver2, self.wait_time).until(
            EC.visibility_of_element_located((By.ID, "access_rights_modified"))
        )
        self.assertEqual(element.is_displayed(), True)
