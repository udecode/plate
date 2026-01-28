import os
import time
import sys

from testing.channels_patch import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from testing.mail import get_outbox, empty_outbox, delete_outbox
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException

from django.conf import settings
from django.test import override_settings

from allauth.account.models import EmailConfirmationHMAC, EmailAddress

MAIL_STORAGE_NAME = "editor"


@override_settings(MAIL_STORAGE_NAME=MAIL_STORAGE_NAME)
@override_settings(EMAIL_BACKEND="testing.mail.EmailBackend")
class EditorTest(SeleniumHelper, ChannelsLiveServerTestCase):
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
        delete_outbox(MAIL_STORAGE_NAME)
        super().tearDownClass()

    def setUp(self):
        self.base_url = self.live_server_url
        self.verificationErrors = []
        self.accept_next_alert = True
        self.user1 = self.create_user(
            username="Yeti", email="yeti@snowman.com", passtext="otter"
        )
        return super().setUp()

    def tearDown(self):
        self.driver.execute_script("window.localStorage.clear()")
        self.driver.execute_script("window.sessionStorage.clear()")
        super().tearDown()
        empty_outbox(MAIL_STORAGE_NAME)
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 3)

    def check_document_count(self, expected_count, timeout=10):
        """
        Check if the number of documents matches the expected count.

        Args:
            expected_count (int): The expected number of documents
            timeout (int): Maximum time to wait in seconds

        Returns:
            bool: True if assertion passes, False if it fails
        """

        def document_count_matches(driver):
            documents = driver.find_elements(
                By.CSS_SELECTOR,
                ".fw-contents tbody tr a.fw-data-table-title",
            )
            return len(documents) == expected_count

        try:
            WebDriverWait(self.driver, timeout).until(document_count_matches)
            return True
        except TimeoutException:
            documents = self.driver.find_elements(
                By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
            )
            actual_count = len(documents)
            raise AssertionError(
                f"Expected {expected_count} documents, but found {actual_count}"
            )

    def assert_with_retry(self, func, *args, max_attempts=3, wait_between=1):
        """
        Retry an assertion multiple times before failing.

        Args:
            func: The function to retry
            *args: Arguments to pass to the function
            max_attempts (int): Number of attempts before failing
            wait_between (int): Seconds to wait between attempts
        """
        for attempt in range(max_attempts):
            try:
                func(*args)
                return
            except AssertionError as e:
                if attempt == max_attempts - 1:
                    raise AssertionError(
                        f"Failed after {max_attempts} attempts. Last error: {str(e)}"
                    )
                time.sleep(wait_between)

    def test_crossrefs_and_internal_links(self):
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
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
        # We enable the abstract
        self.driver.find_element(
            By.CSS_SELECTOR, "#header-navigation > div:nth-child(3) > span"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "#header-navigation > div:nth-child(3) > div "
                "> ul > li:nth-child(1) > span"
            ),
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "#header-navigation > div:nth-child(3) > div "
                "> ul > li:nth-child(1) > div > ul > li:nth-child(3) > span"
            ),
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        ActionChains(self.driver).send_keys(Keys.LEFT).send_keys(
            "An abstract title"
        ).perform()
        time.sleep(1)
        self.driver.find_element(
            By.CSS_SELECTOR, "#toolbar > div > div > div:nth-child(3) > div"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "#toolbar > div > div > div:nth-child(3) > div > div > "
                "ul > li:nth-child(4) > span > label"
            ),
        ).click()
        # We type in the body
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "Body"
        )
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
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.XPATH, '//*[normalize-space()="Photo"]')
            )
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
        # We add a cross reference for the heading
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#toolbar > div > div > div:nth-child(9) > button > span > i",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#edit-link > div:nth-child(2) > select"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#edit-link > div:nth-child(2) > select > option:nth-child(2)",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "body > div.ui-dialog.ui-corner-all.ui-widget."
                "ui-widget-content.ui-front.ui-dialog-buttons > "
                "div.ui-dialog-buttonpane.ui-widget-content."
                "ui-helper-clearfix > div > button.fw-dark."
                "fw-button.ui-button.ui-corner-all.ui-widget"
            ),
        ).click()
        cross_reference = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )
        self.assertEqual(cross_reference.text, "An abstract title")
        # We add a second cross reference to the figure
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#toolbar > div > div > div:nth-child(9) > button > span > i",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#edit-link > div:nth-child(2) > select"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#edit-link > div:nth-child(2) > select > option:nth-child(3)",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "body > div.ui-dialog.ui-corner-all.ui-widget."
                "ui-widget-content.ui-front.ui-dialog-buttons > "
                "div.ui-dialog-buttonpane.ui-widget-content."
                "ui-helper-clearfix > div > button.fw-dark."
                "fw-button.ui-button.ui-corner-all.ui-widget"
            ),
        ).click()
        figure_cross_reference = self.driver.find_elements(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )[1]
        assert figure_cross_reference.text == "Photo 1"
        # We add an internal link
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#toolbar > div > div > div:nth-child(9) > button > span > i",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#edit-link > div:nth-child(5) > select"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#edit-link > div:nth-child(5) > select > option:nth-child(2)",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            (
                "body > div.ui-dialog.ui-corner-all.ui-widget."
                "ui-widget-content.ui-front.ui-dialog-buttons > "
                "div.ui-dialog-buttonpane.ui-widget-content."
                "ui-helper-clearfix > div > button.fw-dark."
                "fw-button.ui-button.ui-corner-all.ui-widget"
            ),
        ).click()
        internal_link = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body a"
        )
        assert internal_link.text == "An abstract title"
        # We change the link text.
        self.driver.find_element(By.CSS_SELECTOR, ".doc-abstract h3").click()
        ActionChains(self.driver).send_keys(Keys.BACKSPACE).send_keys(
            Keys.BACKSPACE
        ).send_keys(Keys.BACKSPACE).send_keys(Keys.BACKSPACE).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).perform()
        internal_link = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body a"
        )
        assert internal_link.text == "An abstract title"
        assert internal_link.get_attribute("title") == "An abstract"
        cross_reference = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )
        assert cross_reference.text == "An abstract"
        # We add a second photo figure to increase the count
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body figure").click()
        ActionChains(self.driver).send_keys(Keys.LEFT).perform()
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
        # click on 'Use image' button
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".datatable-container img")
            )
        ).click()

        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Use image"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(1)
        figure_cross_reference = self.driver.find_elements(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )[1]
        assert figure_cross_reference.text == "Photo 2"

        # We delete the contents from the heading
        self.driver.find_element(By.CSS_SELECTOR, ".doc-abstract h3").click()
        ActionChains(self.driver).send_keys(Keys.BACKSPACE).send_keys(
            Keys.BACKSPACE
        ).send_keys(Keys.BACKSPACE).send_keys(Keys.BACKSPACE).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.BACKSPACE
        ).perform()
        cross_reference = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body .cross-reference.missing-target"
        )
        assert cross_reference.text == "MISSING TARGET"
        internal_link = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body a.missing-target"
        )
        assert internal_link.get_attribute("title") == "Missing target"
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".margin-box.warning"
                )
            ),
            2,
        )
        # We add text to the heading again
        ActionChains(self.driver).send_keys("Title").perform()
        cross_reference = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )
        assert cross_reference.text == "Title"
        internal_link = self.driver.find_element(
            By.CSS_SELECTOR, ".doc-body a"
        )
        assert internal_link.get_attribute("title") == "Title"
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".margin-box.warning"
                )
            ),
            0,
        )
        # We remove the second figure
        self.driver.find_elements(By.CSS_SELECTOR, ".doc-body figure")[
            1
        ].click()
        button = self.driver.find_element(By.XPATH, '//*[@title="Figure"]')
        button.click()
        self.driver.find_element(
            By.XPATH,
            '//*[contains(@class, "ui-button") and normalize-space()="Remove"]',
        ).click()
        time.sleep(1)
        figure_cross_reference = self.driver.find_elements(
            By.CSS_SELECTOR, ".doc-body .cross-reference"
        )[1]
        assert figure_cross_reference.text == "MISSING TARGET"

    def check_body(self, driver, body_text, seconds=False):
        if seconds is False:
            seconds = self.wait_time
        # Contents is child 5.
        current_body_text = driver.execute_script(
            "return window.theApp.page.view.state.doc.child(5).textContent;"
        )
        if seconds < 0:
            assert False, f"Body text incorrect: {current_body_text}"
        elif current_body_text == body_text:
            return True
        else:
            time.sleep(0.1)
            return self.check_body(driver, body_text, seconds - 0.1)

    def test_track_changes(self):
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
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
            "A test article with tracked changes"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "First I type "
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "some"
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            " standard "
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Emphasis]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "text"
        )
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Emphasis]"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            " here.\nI'll even write a second paragraph."
        )
        # Turn on tracked changes
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(5) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(1) > .fw-pulldown-item"
        ).click()
        # Make changes
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        ActionChains(self.driver).double_click(
            self.driver.find_element(By.CSS_SELECTOR, ".doc-body strong")
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        ActionChains(self.driver).double_click(
            self.driver.find_element(By.CSS_SELECTOR, ".doc-body em")
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, "button[title=Strong]"
        ).click()
        time.sleep(1)
        ActionChains(self.driver).send_keys(Keys.RIGHT).send_keys(
            Keys.RIGHT
        ).send_keys(Keys.RIGHT).send_keys(Keys.RIGHT).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.BACKSPACE
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            "insertion"
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.RIGHT
        ).send_keys(
            Keys.ENTER
        ).send_keys(
            Keys.UP
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, ".editor-toolbar .multi-buttons"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            ".editor-toolbar .multi-buttons .ui-button:nth-child(5)",
        ).click()

        change_tracking_boxes = self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box.track"
        )
        self.assertEqual(len(change_tracking_boxes), 6)

    def test_share_document(self):
        yeti2_user = self.create_user(
            username="Yeti2", email="yeti2@snowman.com", passtext="otter"
        )
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
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
            "A test article to share"
        )
        # Turn on tracked changes
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(5) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(1) > .fw-pulldown-item"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "With tracked changes\n"
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
            "yeti2@snowman.com"
        )
        ActionChains(self.driver).send_keys(Keys.TAB).send_keys(
            Keys.RETURN
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-add-button"
        ).click()
        self.driver.find_element(By.ID, "new-contact-user-string").click()
        self.driver.find_element(By.ID, "new-contact-user-string").send_keys(
            "yeti3@snowman.com"
        )
        ActionChains(self.driver).send_keys(Keys.TAB).send_keys(
            Keys.RETURN
        ).perform()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-add-button"
        ).click()
        self.driver.find_element(By.ID, "new-contact-user-string").click()
        self.driver.find_element(By.ID, "new-contact-user-string").send_keys(
            "yeti4@snowman.com"
        )
        ActionChains(self.driver).send_keys(Keys.TAB).send_keys(
            Keys.RETURN
        ).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".collaborator-tr .fa-caret-down")
            )
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Write"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#my-contacts").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(3) .fa-caret-down"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Write"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#my-contacts").click()
        time.sleep(2)
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        outbox = get_outbox(MAIL_STORAGE_NAME)
        # We keep track of the invitation email to open it later.
        user4_invitation_email = outbox[-1].body
        #  Reopen the share dialog and add users 5-7
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
            "yeti5@snowman.com,yeti6@snowman.com;yeti7@snowman.com"
        )
        ActionChains(self.driver).send_keys(Keys.TAB).send_keys(
            Keys.RETURN
        ).perform()
        # Downgrade the write rights to read rights for user4
        self.retry_click(
            self.driver,
            (By.CSS_SELECTOR, "tr:nth-child(3) .fa-caret-down.edit-right"),
        )
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "li[title=Read]"))
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#my-contacts").click()
        # Upgrade the read rights to write rights for user7
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(6) .fa-caret-down.edit-right"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "li[title=Write]"))
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "tr:nth-child(6) i.icon-access-write")
            )
        )
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        outbox = get_outbox(MAIL_STORAGE_NAME)
        # We keep track of the invitation email to open it later.
        last_three_emails = [
            outbox[-3].body,
            outbox[-2].body,
            outbox[-1].body,
        ]
        user5_invitation_email = next(
            (s for s in last_three_emails if "yeti5" in s), None
        )
        user6_invitation_email = next(
            (s for s in last_three_emails if "yeti6" in s), None
        )
        user7_invitation_email = next(
            (s for s in last_three_emails if "yeti7" in s), None
        )
        # We close the editor
        self.driver.find_element(By.ID, "close-document-top").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # Second user logs in, verifies that he has access
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti2")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Go to contacts"]')
            )
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".respond-invite").click()
        # Wait for Accept invite button to appear and use JavaScript click to ensure it works
        accept_button = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Accept invite"]')
            )
        )
        # Use JavaScript click to bypass any event handler timing issues
        time.sleep(1)
        self.driver.execute_script("arguments[0].click();", accept_button)
        # Wait for the dialog to close completely
        WebDriverWait(self.driver, self.wait_time).until(
            EC.invisibility_of_element_located((By.CSS_SELECTOR, ".ui-dialog"))
        )
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        # Wait for document list page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr"
        )
        self.assertEqual(len(documents), 1)
        write_access_rights = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-write"
        )
        self.assertEqual(len(write_access_rights), 1)
        self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        ActionChains(self.driver).send_keys("... in the body").send_keys(
            Keys.ENTER
        ).perform()
        time.sleep(1)
        assert (
            self.driver.find_element(By.CSS_SELECTOR, ".doc-title").text
            == "A test article to share"
        )
        self.check_body(self.driver, "With tracked changes... in the body")
        self.driver.find_element(By.ID, "close-document-top").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # First user logs in again, removes access rights of second user
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        time.sleep(1)
        self.assert_with_retry(self.check_document_count, 1)
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        )

        documents[0].click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(1) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(1) > .fw-pulldown-item"
        ).click()
        # Find and click the delete button for the user (not userinvite) collaborator
        # The collaborator row has id="collaborator-user-2" for user Yeti2
        self.driver.find_element(
            By.CSS_SELECTOR,
            f"#collaborator-user-{yeti2_user.id} .delete-collaborator",
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        self.driver.find_element(By.ID, "close-document-top").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # Second user logs in again to verify that access rights are gone
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti2")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        time.sleep(1)
        self.assert_with_retry(self.check_document_count, 0)

        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # Third user signs up
        self.driver.find_element(By.CSS_SELECTOR, 'a[title="Sign up"]').click()
        self.driver.find_element(By.ID, "id-username").send_keys("Yeti3")
        self.driver.find_element(By.ID, "id-password1").send_keys("password")
        self.driver.find_element(By.ID, "id-password2").send_keys("password")
        self.driver.find_element(By.ID, "id-email").send_keys(
            "yeti3@snowman.com"
        )
        # Scroll all the way down in case we are on a small screen
        self.driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);"
        )
        self.driver.find_element(By.ID, "signup-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'a[href="mailto:yeti3@snowman.com"]')
            )
        )
        email = EmailAddress.objects.filter(email="yeti3@snowman.com").first()
        self.assertIsNotNone(email)
        confirmation_key = EmailConfirmationHMAC(email).key
        self.driver.get(
            f"{self.base_url}/account/confirm-email/{confirmation_key}/"
        )
        self.driver.find_element(By.ID, "terms-check").click()
        self.driver.find_element(By.ID, "test-check").click()
        self.driver.find_element(By.ID, "submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.text_to_be_present_in_element(
                (By.CSS_SELECTOR, ".fw-contents h1"), "Thanks for verifying!"
            )
        )
        self.driver.find_element(By.CSS_SELECTOR, 'a[href="/"]').click()
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti3")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Go to contacts"]')
            )
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".respond-invite").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Accept invite"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        documents = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr"
        )
        self.assertEqual(len(documents), 1)
        read_access_rights = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-read"
        )
        self.assertEqual(len(read_access_rights), 1)
        self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr a.fw-data-table-title"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "Some extra content that doesn't show"
        )
        assert (
            self.driver.find_element(By.CSS_SELECTOR, ".doc-title").text
            == "A test article to share"
        )
        self.check_body(self.driver, "With tracked changes... in the body")
        # Make a copy of the file
        old_body = self.driver.find_element(By.CSS_SELECTOR, ".doc-body")
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(1) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(4) > .fw-pulldown-item"
        ).click()
        # Check whether user now has write access
        WebDriverWait(self.driver, self.wait_time).until(
            EC.staleness_of(old_body)
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").send_keys(
            "Some extra content that does show"
        )
        self.check_body(
            self.driver,
            (
                "With tracked changes... in the body"
                "Some extra content that does show"
            ),
        )
        # Filter tracks by users
        change_tracking_boxes = self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box.track:not(.hidden)"
        )
        self.assertEqual(len(change_tracking_boxes), 5)
        self.driver.find_element(
            By.CSS_SELECTOR, "#margin-box-filter-track .show-marginbox-options"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#margin-box-filter-track .show-marginbox-options-submenu",
        ).click()
        self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box-filter-track-author"
        )[1].click()
        change_tracking_boxes = self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box.track:not(.hidden)"
        )
        self.assertEqual(len(change_tracking_boxes), 2)
        self.driver.find_element(
            By.CSS_SELECTOR, "#margin-box-filter-track .show-marginbox-options"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#margin-box-filter-track .show-marginbox-options-submenu",
        ).click()
        self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box-filter-track-author"
        )[2].click()
        change_tracking_boxes = self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box.track:not(.hidden)"
        )
        self.assertEqual(len(change_tracking_boxes), 2)
        self.driver.find_element(
            By.CSS_SELECTOR, "#margin-box-filter-track"
        ).click()
        change_tracking_boxes = self.driver.find_elements(
            By.CSS_SELECTOR, ".margin-box.track:not(.hidden)"
        )
        self.assertEqual(len(change_tracking_boxes), 0)
        # Give user 1 write access to document
        self.driver.find_element(
            By.CSS_SELECTOR, ".header-menu:nth-child(1) > .header-nav-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "li:nth-child(1) > .fw-pulldown-item"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#my-contacts > table > tbody > tr > td"
        ).click()
        self.driver.find_element(By.ID, "add-share-contact").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".collaborator-tr .fa-caret-down")
            )
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Write"]'
        ).click()
        time.sleep(1)
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        # Tag user 1 in comment
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        ActionChains(self.driver).key_down(Keys.SHIFT).send_keys(
            Keys.LEFT
        ).send_keys(Keys.LEFT).send_keys(Keys.LEFT).send_keys(
            Keys.LEFT
        ).key_up(
            Keys.SHIFT
        ).perform()
        self.driver.find_element(By.CSS_SELECTOR, "button .fa-comment").click()
        ActionChains(self.driver).send_keys("Hello @Yeti").perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".tag-user"))
        ).click()
        outbox = get_outbox(MAIL_STORAGE_NAME)
        emails_sent_before_comment = len(outbox)
        self.driver.find_element(
            By.CSS_SELECTOR, ".comment-btns .submit"
        ).click()
        outbox = get_outbox(MAIL_STORAGE_NAME)
        self.assertEqual(emails_sent_before_comment + 1, len(outbox))
        self.driver.find_element(By.ID, "close-document-top").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, 'a[href="/account/sign-up/"]')
            )
        )
        # User 4 signs up using invitation link but different email than what
        # was in the invitation email (this should work)
        invitation_link = self.find_urls(user4_invitation_email)[0]
        self.driver.get(invitation_link)
        self.driver.find_element(By.CSS_SELECTOR, 'a[title="Sign up"]').click()
        self.driver.find_element(By.ID, "id-username").send_keys("Yeti4")
        self.driver.find_element(By.ID, "id-password1").send_keys("password")
        self.driver.find_element(By.ID, "id-password2").send_keys("password")
        self.driver.find_element(By.ID, "id-email").send_keys(
            "yeti4a@snowman.com"
        )
        self.driver.find_element(By.ID, "signup-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'a[href="mailto:yeti4a@snowman.com"]')
            )
        )
        outbox = get_outbox(MAIL_STORAGE_NAME)
        confirmation_link = self.find_urls(outbox[-1].body)[0]
        self.driver.get(confirmation_link)
        self.driver.find_element(By.ID, "terms-check").click()
        self.driver.find_element(By.ID, "test-check").click()
        self.driver.find_element(By.ID, "submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.text_to_be_present_in_element(
                (By.CSS_SELECTOR, ".fw-contents h1"), "Thanks for verifying!"
            )
        )
        self.driver.find_element(By.CSS_SELECTOR, 'a[href="/"]').click()
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti4")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Go to contacts"]')
            )
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".respond-invite").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Accept invite"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 1)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # User 5 signs up with a different email first and then clicks the
        # invitation link and accepts the invite.
        self.create_user(
            username="Yeti5", email="yeti5a@snowman.com", passtext="password"
        )
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti5")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 0)
        invitation_link = self.find_urls(user5_invitation_email)[0]
        self.driver.get(invitation_link)
        self.driver.find_element(By.CSS_SELECTOR, ".respond-invite").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Accept invite"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 1)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # User 6 signs up with a different email first and then clicks the
        # invitation link and declines the invite.
        self.create_user(
            username="Yeti6", email="yeti6a@snowman.com", passtext="password"
        )
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti6")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 0)
        invitation_link = self.find_urls(user6_invitation_email)[0]
        self.driver.get(invitation_link)
        self.driver.find_element(By.CSS_SELECTOR, ".respond-invite").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Decline invite"]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Documents"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 0)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # User3 signs in and accepts the invite of user7. Access rights
        # should be upgraded to write access.
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti3")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        time.sleep(1)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 2)
        read_access_rights = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-read"
        )
        self.assertEqual(len(read_access_rights), 1)
        invitation_link = self.find_urls(user7_invitation_email)[0]
        self.driver.get(invitation_link)
        time.sleep(1)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".respond-invite")
            )
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Accept invite"]'
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Documents"]')
            )
        ).click()
        time.sleep(1)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 2)
        time.sleep(1)
        doc_texts = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-searchable"
        )
        self.assertEqual(doc_texts[0].text, "A test article to share")
        self.assertEqual(doc_texts[1].text, "Yeti")
        self.assertEqual(doc_texts[2].text, "Copy of A test article to share")
        self.assertEqual(doc_texts[3].text, "Yeti3")
        write_access_rights = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-write"
        )
        self.assertEqual(len(write_access_rights), 2)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        # Log in as document owner and downgrade access right of user 3.
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti")
        self.driver.find_element(By.ID, "id-password").send_keys("otter")
        self.driver.find_element(By.ID, "login-submit").click()
        time.sleep(1)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 2)
        self.driver.find_element(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-write"
        ).click()
        # Downgrade the write rights to read rights for user 3
        self.driver.find_element(
            By.CSS_SELECTOR, "tr:nth-child(1) .fa-caret-down.edit-right"
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Read"]'
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, "#my-contacts").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog .fw-dark"
        ).click()
        # Enter contacts page and check number of contacts
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.ID, "preferences-btn"))
        ).click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Contacts"]'
        ).click()
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select.user"
                )
            ),
            4,
        )
        # Delete contact connection of user 4 - doc access should be gone.
        self.driver.find_elements(By.CSS_SELECTOR, ".delete-single-contact")[
            2
        ].click()
        self.driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()
        time.sleep(self.wait_time / 3)
        self.assertEqual(
            len(
                self.driver.find_elements(
                    By.CSS_SELECTOR, ".contacts-table .entry-select.user"
                )
            ),
            3,
        )
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti3")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.assert_with_retry(self.check_document_count, 2)
        read_access_rights = self.driver.find_elements(
            By.CSS_SELECTOR, ".fw-contents tbody tr .icon-access-read"
        )
        self.assertEqual(len(read_access_rights), 1)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
        self.driver.find_element(By.ID, "id-login").send_keys("Yeti4")
        self.driver.find_element(By.ID, "id-password").send_keys("password")
        self.driver.find_element(By.ID, "login-submit").click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        # Wait for document list to be interactive
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".fw-contents"))
        )
        self.assert_with_retry(self.check_document_count, 0)
        self.driver.find_element(By.CSS_SELECTOR, "#preferences-btn").click()
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Log out"]'
        ).click()
