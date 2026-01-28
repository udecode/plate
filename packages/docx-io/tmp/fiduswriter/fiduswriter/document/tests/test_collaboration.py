import os
import sys
import time
import multiprocessing
from random import randrange
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import ElementClickInterceptedException
from django.conf import settings
from channels.testing import ChannelsLiveServerTestCase
from .editor_helper import EditorHelper


class OneUserTwoBrowsersTests(EditorHelper, ChannelsLiveServerTestCase):
    """
    Tests in which collaboration between two browsers with the same user logged
    into both browsers.
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

    def tearDown(self):
        super().tearDown()
        if "coverage" in sys.modules.keys():
            # Cool down
            time.sleep(self.wait_time / 3)

    def setUp(self):
        self.user = self.create_user()
        self.login_user(self.user, self.driver, self.client)
        self.login_user(self.user, self.driver2, self.client2)
        self.doc = self.create_new_document(self.user)
        super().setUp()

    def get_title(self, driver):
        # Title is child 0.
        return driver.execute_script(
            "return window.theApp.page.view.state.doc.firstChild.textContent;"
        )

    def test_typing(self):
        """
        Test typing in collaborative mode with one user using browser windows
        with the user typing separately at small, random intervals.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        title_input = self.driver.find_element(By.CLASS_NAME, "doc-title")
        title_input2 = self.driver2.find_element(By.CLASS_NAME, "doc-title")

        first_part = "Here is "
        second_part = "my title"

        for i in range(8):
            title_input.send_keys(second_part[i])
            time.sleep(randrange(30, 40) / 200.0)
            title_input2.send_keys(first_part[i])
            time.sleep(randrange(30, 40) / 200.0)

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(16, len(self.get_title(self.driver)))

        self.assertEqual(
            self.get_title(self.driver2), self.get_title(self.driver)
        )

        body_input = self.driver.find_element(By.CLASS_NAME, "doc-body")
        body_input2 = self.driver2.find_element(By.CLASS_NAME, "doc-body")
        body_input.click()
        body_input2.click()

        body_input.click()
        body_input2.click()

        for char in self.TEST_TEXT:
            body_input.send_keys(char)
            time.sleep(randrange(30, 40) / 200.0)
            body_input2.send_keys(char)
            time.sleep(randrange(30, 40) / 200.0)

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

    def test_threaded_typing(self):
        """
        Test typing in collaborative mode with one user using browser windows
        with the user typing simultaneously in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        title_input = self.driver.find_element(By.CLASS_NAME, "doc-title")
        title_input2 = self.driver2.find_element(By.CLASS_NAME, "doc-title")

        first_part = "Here is "
        second_part = "my title"

        p1 = multiprocessing.Process(
            target=self.input_text, args=(title_input, second_part)
        )
        p2 = multiprocessing.Process(
            target=self.input_text, args=(title_input2, first_part)
        )
        p1.start()
        p2.start()
        p1.join()
        p2.join()

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(16, len(self.get_title(self.driver)))

        self.assertEqual(
            self.get_title(self.driver2), self.get_title(self.driver)
        )

        body_input = self.driver.find_element(By.CLASS_NAME, "doc-body")
        body_input2 = self.driver2.find_element(By.CLASS_NAME, "doc-body")
        body_input.click()
        body_input2.click()

        body_input.click()
        body_input2.click()

        p1 = multiprocessing.Process(
            target=self.input_text, args=(body_input, self.TEST_TEXT)
        )
        p2 = multiprocessing.Process(
            target=self.input_text, args=(body_input2, self.TEST_TEXT)
        )
        p1.start()
        p2.start()
        p1.join()
        p2.join()

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.TEST_TEXT) * 2, len(self.get_contents(self.driver))
        )

        self.assertEqual(
            self.get_contents(self.driver2), self.get_contents(self.driver)
        )

    def make_bold(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Strong"]')
        button.click()

    def get_boldtext(self, driver):
        btext = driver.find_element(
            By.XPATH, '//*[contains(@class, "doc-body")]/p/strong'
        )
        return btext.text

    def test_select_and_bold(self):
        """
        Test typing in collaborative mode with one user typing and
        another user bold some part of the text in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,29)")

        p2 = multiprocessing.Process(
            target=self.make_bold, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(5, len(self.get_boldtext(self.driver2)))

        self.assertEqual(
            len(self.get_boldtext(self.driver)),
            len(self.get_boldtext(self.driver2)),
        )

    def make_italic(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Emphasis"]')
        button.click()

    def get_italictext(self, driver):
        itext = driver.find_element(
            By.XPATH, '//*[contains(@class, "doc-body")]/p/em'
        )
        return itext.text

    def test_select_and_italic(self):
        """
        Test typing in collaborative mode with one user typing and
        another user italic some part of the text in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,29)")

        p2 = multiprocessing.Process(
            target=self.make_italic, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(5, len(self.get_italictext(self.driver2)))

        self.assertEqual(
            len(self.get_italictext(self.driver)),
            len(self.get_italictext(self.driver2)),
        )

    def make_numberedlist(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Numbered list"]')
        button.click()

    def get_numberedlist(self, driver):
        numberedTags = driver.find_elements(
            By.XPATH, '//*[contains(@class, "doc-body")]//ol//li'
        )
        return numberedTags

    def test_numberedlist(self):
        """
        Test typing in collaborative mode with one user typing and
        another user use numbered list button in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)
        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text,
            args=(document_input, self.MULTILINE_TEST_TEXT),
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,24)")

        p2 = multiprocessing.Process(
            target=self.make_numberedlist, args=(self.driver2,)
        )
        p2.start()
        p2.join()

        # Wait for the first processor to write some text and go to next line
        self.wait_for_doc_size(self.driver2, 47)

        self.driver2.execute_script("window.testCaret.setSelection(42,42)")

        p2 = multiprocessing.Process(
            target=self.make_numberedlist, args=(self.driver2,)
        )
        p2.start()

        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.get_numberedlist(self.driver)),
            len(self.get_numberedlist(self.driver2)),
        )

        self.assertEqual(2, len(self.get_numberedlist(self.driver2)))

    def make_bulletlist(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Bullet list"]')
        button.click()

    def get_bulletlist(self, driver):
        bulletTags = driver.find_elements(
            By.XPATH, '//*[contains(@class, "doc-body")]//ul//li'
        )
        return bulletTags

    def test_bulletlist(self):
        """
        Test typing in collaborative mode with one user typing and
        another user use bullet list button in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text,
            args=(document_input, self.MULTILINE_TEST_TEXT),
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,24)")

        p2 = multiprocessing.Process(
            target=self.make_bulletlist, args=(self.driver2,)
        )
        p2.start()
        p2.join()

        # Wait for the first processor to write enough text and go to next line
        self.wait_for_doc_size(self.driver2, 47)

        self.driver2.execute_script("window.testCaret.setSelection(42,42)")

        p2 = multiprocessing.Process(
            target=self.make_bulletlist, args=(self.driver2,)
        )
        p2.start()

        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(2, len(self.get_bulletlist(self.driver2)))

        self.assertEqual(
            len(self.get_bulletlist(self.driver)),
            len(self.get_bulletlist(self.driver2)),
        )

    def make_blockquote(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Blockquote"]')
        button.click()

    def get_blockquote(self, driver):
        blockquoteTags = driver.find_elements(
            By.XPATH, '//*[contains(@class, "doc-body")]/blockquote'
        )
        return blockquoteTags

    def test_blockquote(self):
        """
        Test typing in collaborative mode with one user typing and
        another user use block qoute button in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 23)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,24)")

        p2 = multiprocessing.Process(
            target=self.make_blockquote, args=(self.driver2,)
        )
        p2.start()
        p2.join()
        p1.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(1, len(self.get_blockquote(self.driver2)))

        self.assertEqual(
            len(self.get_blockquote(self.driver)),
            len(self.get_blockquote(self.driver2)),
        )

    def addlink(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Link"]')
        button.click()

        # wait to load popup
        linktitle = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "link-title"))
        )
        linktitle.click()
        self.input_text(linktitle, "Test link")

        link = driver.find_element(By.CLASS_NAME, "link")
        self.input_text(link, "example.com")

        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()

    def get_link(self, driver):
        atag = driver.find_element(
            By.XPATH, '//*[contains(@class, "doc-body")]/p/a'
        )
        return atag.text

    def test_add_link(self):
        """
        Test typing in collaborative mode with one user typing and
        another user select some part of the text and add link
        in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,29)")

        p2 = multiprocessing.Process(target=self.addlink, args=(self.driver2,))
        p2.start()
        p1.join()
        p2.join()
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(5, len(self.get_link(self.driver2)))

        self.assertEqual(
            len(self.get_link(self.driver)), len(self.get_link(self.driver2))
        )

    def make_footnote(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Footnote"]')
        button.click()

        # wait for footnote to be created
        WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CLASS_NAME, "footnote-container")
            )
        )

        footnote_box = driver.find_element(By.ID, "footnote-box-container")
        footnote_editor = footnote_box.find_element(
            By.CLASS_NAME, "ProseMirror"
        )
        footnote_editor.click()

        self.input_text(footnote_editor, "footnote Text")

    def get_footnote(self, driver):
        atag = driver.find_element(
            By.XPATH, '//*[@id="footnote-box-container"]/div[2]/div[1]/p[1]'
        )
        return atag.text

    def test_footnote(self):
        """
        Test typing in collaborative mode with one user typing and
        another user add a footnote in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(27,27)")

        p2 = multiprocessing.Process(
            target=self.make_footnote, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(13, len(self.get_footnote(self.driver2)))

        self.assertEqual(
            len(self.get_footnote(self.driver)),
            len(self.get_footnote(self.driver2)),
        )

    def perform_delete_undo(self, driver):
        actions = ActionChains(driver)
        actions.send_keys(Keys.BACKSPACE)
        actions.perform()

        button = driver.find_element(By.XPATH, '//*[@title="Undo"]')
        button.click()

    def get_undo(self, driver):
        content = driver.find_element(By.CLASS_NAME, "doc-body")
        return (
            content.get_attribute("innerText")
            .rstrip("\ufeff\n")
            .replace("\n", "")
        )

    def test_delete_undo(self):
        """
        Test typing in collaborative mode with one user typing and
        another user delete and undo some part of the text in two different
        threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "doc-title")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,29)")

        p2 = multiprocessing.Process(
            target=self.perform_delete_undo, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(self.TEST_TEXT, self.get_undo(self.driver2))

        self.assertEqual(
            self.get_undo(self.driver), self.get_undo(self.driver2)
        )

    def get_shadow_root(self, driver, element):
        return driver.execute_script("return arguments[0].shadowRoot", element)

    def make_mathequation(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Math"]')
        button.click()
        # wait for load of popup
        insert_button = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "insert-math"))
        )

        # type formula
        math_field = WebDriverWait(driver, self.wait_time).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "math-field"))
        )
        math_field.click()
        math_field_shadow_dom = self.get_shadow_root(driver, math_field)
        keyboard_toggle = math_field_shadow_dom.find_element(
            By.CSS_SELECTOR, "div.ML__virtual-keyboard-toggle"
        )
        keyboard_toggle.click()
        # wait for keyboard
        element = WebDriverWait(driver, self.wait_time).until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//div[contains(@class, 'MLK__keycap')]",
                )
            )
        )
        element = WebDriverWait(driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//div[contains(@class, 'MLK__keycap') and text()='2']",
                )
            )
        )
        try:
            element.click()
        except ElementClickInterceptedException:
            time.sleep(1)
            WebDriverWait(driver, self.wait_time).until(
                EC.element_to_be_clickable(
                    (
                        By.XPATH,
                        "//div[contains(@class, 'MLK__keycap') and text()='2']",
                    )
                )
            ).click()
        driver.find_element(
            By.CSS_SELECTOR, "div.MLK__keycap"  # The first key - X
        ).click()
        driver.find_element(
            By.XPATH, "//div[contains(@class, 'MLK__keycap') and text()='+']"
        ).click()
        driver.find_element(
            By.XPATH, "//div[contains(@class, 'MLK__keycap') and text()='3']"
        ).click()
        driver.find_element(
            By.XPATH, "//div[contains(@class, 'MLK__keycap') and text()='=']"
        ).click()
        driver.find_element(
            By.XPATH, "//div[contains(@class, 'MLK__keycap') and text()='7']"
        ).click()
        # close keyboard
        driver.find_element(By.CLASS_NAME, "ui-dialog-titlebar").click()
        insert_button.click()

    def get_mathequation(self, driver):
        math = driver.find_element(By.XPATH, '//*[@class="equation"]')

        return math.get_attribute("data-equation")

    def test_mathequation(self):
        """
        Test typing in collaborative mode with one user typing and
        another user insert math equation in middle of the text in two
        different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 28)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(27,27)")

        p2 = multiprocessing.Process(
            target=self.make_mathequation, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(self.get_mathequation(self.driver)),
            len(self.get_mathequation(self.driver2)),
        )

        self.assertEqual(6, len(self.get_mathequation(self.driver2)))

    def add_comment(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Comment"]')
        button.click()

        textArea = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".ProseMirror-wrapper .ProseMirror")
            )
        )
        textArea.click()

        self.input_text(textArea, "My comment")

        driver.find_element(
            By.CSS_SELECTOR, "div#comment-editor button.submit"
        ).click()

    def get_comment(self, driver):
        comment = driver.find_element(By.CLASS_NAME, "comment-text-wrapper")

        return comment.text

    def test_comment(self):
        """
        Test typing in collaborative mode with one user typing and
        another user add some comment in middle of the text in two different
        threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 31)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(24,29)")

        p2 = multiprocessing.Process(
            target=self.add_comment, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(10, len(self.get_comment(self.driver2)))

        self.assertEqual(
            len(self.get_comment(self.driver)),
            len(self.get_comment(self.driver2)),
        )

        # Change comment
        self.driver.find_element(
            By.CSS_SELECTOR, ".margin-box.comment .show-marginbox-options"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".edit-comment").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#comment-editor p"
        ).send_keys("MODIFICATION")
        self.driver.find_element(By.CSS_SELECTOR, ".comment-is-major").click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#comment-editor .submit"
        ).click()
        WebDriverWait(self.driver2, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".margin-box.comment-is-major-bgc")
            )
        )
        self.assertEqual(22, len(self.get_comment(self.driver2)))
        self.assertEqual(
            len(self.get_comment(self.driver)),
            len(self.get_comment(self.driver2)),
        )
        time.sleep(1)
        # Add comment answer
        WebDriverWait(self.driver2, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".margin-box.comment")
            )
        ).click()
        WebDriverWait(self.driver2, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#answer-editor .ProseMirror")
            )
        ).send_keys("My answer")
        self.driver2.find_element(
            By.CSS_SELECTOR, ".comment-answer .submit"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".margin-box.comment"
        ).click()
        comment_answer = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".comment-answer .comment-text-wrapper p")
            )
        )
        assert comment_answer.text == "My answer"

        # Modify comment answer
        comment_answer.click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".comment-answer .show-marginbox-options"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".edit-comment-answer"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, "#answer-editor p"
        ).send_keys("\nMODIFICATION")
        self.driver.find_element(
            By.CSS_SELECTOR, ".comment-answer .submit"
        ).click()
        answer_addition = WebDriverWait(self.driver2, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".comment-answer .comment-text-wrapper p+p")
            )
        )
        assert answer_addition.text == "MODIFICATION"

        # Delete comment answer
        answer_addition.click()
        self.driver2.find_element(
            By.CSS_SELECTOR, ".comment-answer .show-marginbox-options"
        ).click()
        self.driver2.find_element(
            By.CSS_SELECTOR, ".delete-comment-answer"
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, ".comment-answer.collapse")
            )
        )

        # Delete comment
        self.driver.find_element(
            By.CSS_SELECTOR, ".margin-box.comment"
        ).click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".margin-box.comment .show-marginbox-options"
        ).click()
        self.driver.find_element(By.CSS_SELECTOR, ".delete-comment").click()
        WebDriverWait(self.driver2, self.wait_time).until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, ".margin-box.comment")
            )
        )

    def add_figure(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Figure"]')
        button.click()
        time.sleep(1)
        # click on 'Insert image' button
        WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Insert image"]')
            )
        ).click()

        upload_button = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[normalize-space()="Add new image"]')
            )
        )

        upload_button.click()

        # image path
        image_path = os.path.join(
            settings.PROJECT_PATH, "document/tests/uploads/image.png"
        )

        # inorder to select the image we send the image path in the
        # LOCAL MACHINE to the input tag
        upload_image_url = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.XPATH, '//*[@id="editimage"]/div[1]/input[2]')
            )
        )
        upload_image_url.send_keys(image_path)

        # click on 'Upload' button
        driver.find_element(
            By.XPATH,
            '//*[contains(@class, "ui-button") and normalize-space()="Upload"]',
        ).click()

        # click on 'Use image' button
        WebDriverWait(driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".fw-data-table i.fa-check")
            )
        )

        driver.find_element(
            By.XPATH, '//*[normalize-space()="Use image"]'
        ).click()

        # click on 'Insert' button
        driver.find_element(By.CSS_SELECTOR, "button.fw-dark").click()

        caption = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "div.doc-body figure figcaption")
            )
        )
        caption.click()
        self.input_text(caption, "My figure")

    def get_images(self, driver):
        images = driver.find_elements(
            By.CSS_SELECTOR, "div.doc-body figure img[data-image]"
        )

        return images

    def get_caption(self, driver):
        caption = driver.find_element(
            By.CSS_SELECTOR, "div.doc-body figure figcaption"
        )

        return caption.text

    def test_insertFigure(self):
        """
        Test typing in collaborative mode with one user typing and
        another user insert figure middle of the text in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        self.add_title(self.driver)

        document_input = self.driver.find_element(By.CLASS_NAME, "ProseMirror")

        # Total: 23
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CLASS_NAME, "ProseMirror")
        content.click()

        self.driver2.execute_script("window.testCaret.setSelection(27,27)")

        p2 = multiprocessing.Process(
            target=self.add_figure, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        # Wait for the two editors to be synched
        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(1, len(self.get_images(self.driver2)))

        self.assertEqual(
            len(self.get_images(self.driver)),
            len(self.get_images(self.driver2)),
        )

        self.assertEqual(9, len(self.get_caption(self.driver2)))
        self.assertEqual(
            len(self.get_caption(self.driver)),
            len(self.get_caption(self.driver2)),
        )

        # Check if image is still there after reload
        self.driver.refresh()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "div.doc-body figure")
            )
        )
        self.assertEqual(1, len(self.get_images(self.driver)))

    def add_citation(self, driver):
        button = driver.find_element(By.XPATH, '//*[@title="Cite"]')
        button.click()

        # click on 'Register new source' button
        register_new_source = WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CLASS_NAME, "register-new-bib-source")
            )
        )
        register_new_source.click()

        # select source
        WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "select-bibtype"))
        )

        # click on article
        Select(
            driver.find_element(By.ID, "select-bibtype")
        ).select_by_visible_text("Article")

        # fill the values
        title_of_publication = driver.find_element(
            By.CSS_SELECTOR, ".journaltitle .ProseMirror"
        )
        title_of_publication.click()
        title_of_publication.send_keys("My publication title")

        title = driver.find_element(By.CSS_SELECTOR, ".title .ProseMirror")
        title.click()
        title.send_keys("My title")

        author_firstName = driver.find_element(
            By.CSS_SELECTOR, ".author .given .ProseMirror"
        )
        author_firstName.click()
        time.sleep(1)
        author_firstName.send_keys("John")

        author_lastName = driver.find_element(
            By.CSS_SELECTOR, ".author .family .ProseMirror"
        )
        author_lastName.click()
        time.sleep(1)
        author_lastName.send_keys("Doe")

        publication_date = driver.find_element(By.CSS_SELECTOR, ".date .date")
        publication_date.click()
        time.sleep(1)
        publication_date.send_keys("2012")

        # click on Submit button
        driver.find_element(
            By.XPATH,
            '//*[contains(@class, "ui-button") and normalize-space()="Submit"]',
        ).click()

        # Wait for source to be listed
        WebDriverWait(driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    "#selected-cite-source-table .selected-source",
                )
            )
        )

        # click on Insert button
        driver.find_element(By.CSS_SELECTOR, ".insert-citation").click()

    def get_citation_within_text(self, driver):
        cite_within_doc = driver.find_element(
            By.CSS_SELECTOR, "div.doc-body span.citation"
        )
        return cite_within_doc.text

    def get_citation_bib(self, driver):
        cite_bib = driver.find_element(By.CLASS_NAME, "doc-bibliography")
        return cite_bib.text

    def test_citation(self):
        """
        Test typing in collaborative mode with one user typing and
        another user adding a citation in two different threads.
        """
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)

        # Set citation style
        self.driver.find_element(
            By.XPATH, '//span[contains(normalize-space(), "Settings")]'
        ).click()
        self.driver.find_element(
            By.XPATH, '//span[normalize-space()="Citation Style"]'
        ).click()
        self.driver.find_element(
            By.XPATH,
            '//span[normalize-space()="American Psychological Association 7th edition"]',
        ).click()
        time.sleep(1)
        # Exit menu by hitting ESC
        self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)

        # Set title
        self.add_title(self.driver)
        document_input = self.driver.find_element(By.CLASS_NAME, "doc-body")

        # Total: 22
        self.driver.execute_script("window.testCaret.setSelection(24,24)")

        p1 = multiprocessing.Process(
            target=self.input_text, args=(document_input, self.TEST_TEXT)
        )
        p1.start()

        # Wait for the first processor to write some text
        self.wait_for_doc_size(self.driver2, 32)

        # Without clicking on content the buttons will not work
        content = self.driver2.find_element(By.CSS_SELECTOR, "div.doc-body p")
        content.click()

        p2 = multiprocessing.Process(
            target=self.add_citation, args=(self.driver2,)
        )
        p2.start()
        p1.join()
        p2.join()

        self.wait_for_doc_sync(self.driver, self.driver2)

        # Select citation
        self.driver.find_element(
            By.CSS_SELECTOR, "div.doc-body span.citation"
        ).click()

        # Enter citation dialog
        button = self.driver.find_element(By.XPATH, '//*[@title="Cite"]')
        button.click()

        # Verify that citation is correct in citation dialog.
        citation_in_dialog = self.driver.find_element(
            By.CSS_SELECTOR,
            "#my-sources > div > div.datatable-container > table > tbody > tr > td:nth-child(2)",
        )
        self.assertEqual(citation_in_dialog.text, "Doe, John")

        # Close dialog
        cancel_button = self.driver.find_element(
            By.XPATH, '//button[normalize-space()="Cancel"]'
        )
        cancel_button.click()

        # Verify that citation is correct in both documents
        self.assertEqual(
            len(self.get_citation_within_text(self.driver)),
            len(self.get_citation_within_text(self.driver2)),
        )
        self.assertEqual(
            "(Doe, 2012)", self.get_citation_within_text(self.driver2)
        )

        self.assertEqual(
            "Bibliography\nDoe, J. (2012). My title. In My publication title.",
            self.get_citation_bib(self.driver),
        )

        self.assertEqual(
            len(self.get_citation_bib(self.driver)),
            len(self.get_citation_bib(self.driver2)),
        )

        # We delete the citation again
        ActionChains(self.driver).double_click(
            self.driver.find_element(
                By.CSS_SELECTOR, "div.doc-body span.citation"
            )
        ).send_keys(Keys.BACKSPACE).perform()

        self.wait_for_doc_sync(self.driver, self.driver2)

        self.assertEqual(
            len(
                self.driver2.find_elements(
                    By.CSS_SELECTOR, "div.doc-body span.citation"
                )
            ),
            0,
        )

        self.assertEqual(0, len(self.get_citation_bib(self.driver)))

        self.assertEqual(
            len(self.get_citation_bib(self.driver)),
            len(self.get_citation_bib(self.driver2)),
        )

    def test_chat(self):
        "Test whether chat messages can be delivered"
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)
        self.driver.find_element(By.ID, "messageform").click()
        actions = ActionChains(self.driver)
        actions.send_keys("hello\n")
        actions.perform()
        message_body = WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "message-body"))
        )
        assert message_body.text == "hello"

        message_body2 = WebDriverWait(self.driver2, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "message-body"))
        )
        assert message_body2.text == "hello"

    def test_modify_path(self):
        "Test whether changing the path in one editor changes it in the other"
        self.load_document_editor(self.driver, self.doc)
        self.load_document_editor(self.driver2, self.doc)
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            "Test Article"
        )
        self.wait_for_doc_sync(self.driver, self.driver2)
        self.assertEqual(
            self.driver2.find_element(By.CSS_SELECTOR, "#document-title").text,
            "Test Article",
        )
        # Delete existing path and insert just path
        self.driver2.find_element(By.CSS_SELECTOR, "#document-title").click()
        self.driver2.find_element(
            By.CSS_SELECTOR, "#document-title"
        ).send_keys(Keys.CONTROL, "a")
        self.driver2.find_element(
            By.CSS_SELECTOR, "#document-title"
        ).send_keys("/Reports/2019/")
        self.driver2.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.wait_for_doc_sync(self.driver, self.driver2)
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "#document-title").text,
            "/Reports/2019/Test Article",
        )
        # Delete existing path and insert path including filename
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").click()
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").send_keys(
            Keys.CONTROL, "a"
        )
        self.driver.find_element(By.CSS_SELECTOR, "#document-title").send_keys(
            "/Reports/2019/Report 23"
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.wait_for_doc_sync(self.driver, self.driver2)
        self.assertEqual(
            self.driver2.find_element(By.CSS_SELECTOR, "#document-title").text,
            "/Reports/2019/Report 23",
        )
        # Reload page and check if path is still the same.
        self.driver.refresh()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#document-title")
            )
        )
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "#document-title").text,
            "/Reports/2019/Report 23",
        )
        # Delete entire path to obtain doc title again.
        self.driver2.find_element(By.CSS_SELECTOR, "#document-title").click()
        self.driver2.find_element(
            By.CSS_SELECTOR, "#document-title"
        ).send_keys(Keys.CONTROL, "a")
        self.driver2.find_element(
            By.CSS_SELECTOR, "#document-title"
        ).send_keys(Keys.DELETE)
        self.driver2.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.wait_for_doc_sync(self.driver, self.driver2)
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "#document-title").text,
            "Test Article",
        )
