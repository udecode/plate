import time
from random import randrange
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from testing.selenium_helper import SeleniumHelper
from document.models import Document


class EditorHelper(SeleniumHelper):
    """
    Common functions used in threaded tests
    """

    def create_new_document(self, user):
        doc = Document.objects.create(
            owner=user, template_id=1
        )  # from fixture
        doc.save()
        return doc

    def load_document_editor(self, driver, doc):
        driver.get(f"{self.live_server_url}{doc.get_absolute_url()}")
        WebDriverWait(driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.inject_helpers(driver)

    def inject_helpers(self, driver):
        with open("static-transpile/js/test_caret.js") as file:
            test_caret_script = file.read()
        driver.execute_script(test_caret_script)

    def input_text(self, document_input, text):
        for char in text:
            document_input.send_keys(char)
            time.sleep(randrange(10, 40) / 200.0)

    def type_text(self, driver, text):
        for char in text:
            actions = ActionChains(driver)
            actions.send_keys(char)
            actions.perform()
            time.sleep(randrange(10, 40) / 200.0)

    def add_title(self, driver):
        title = "My title"
        self.driver.find_element(By.CLASS_NAME, "doc-title").send_keys(title)

    def get_contents(self, driver):
        # Contents is child 5.
        return driver.execute_script(
            "return window.theApp.page.view.state.doc.child(5).textContent;"
        )

    def wait_for_doc_size(self, driver, size, seconds=False):
        if seconds is False:
            seconds = self.wait_time
        doc_size = driver.execute_script(
            "return window.theApp.page.view.state.doc.content.size"
        )
        if doc_size < size and seconds > 0:
            time.sleep(0.1)
            self.wait_for_doc_size(driver, size, seconds - 0.1)

    def wait_for_doc_sync(self, driver, driver2, seconds=False):
        # Wait at least 1/4 second just in case documents are about to change.
        time.sleep(0.25)
        if seconds is False:
            seconds = self.wait_time
        doc_str = driver.execute_script(
            "return window.theApp.page.view.state.doc.toString()"
        )
        doc2_str = driver2.execute_script(
            "return window.theApp.page.view.state.doc.toString()"
        )
        if doc_str != doc2_str:
            # The strings don't match.
            time.sleep(0.1)
            self.wait_for_doc_sync(driver, driver2, seconds - 0.1)

    def add_footnote(
        self, driver, footnote_pos, footnote_content, footnote_num
    ):
        driver.execute_script(
            f"window.testCaret.setSelection({footnote_pos},{footnote_pos})"
        )
        driver.find_element(By.XPATH, '//*[@title="Footnote"]').click()

        driver.find_element(
            By.XPATH,
            f'//*[@id="footnote-box-container"]/div[2]/div[{footnote_num}]',
        ).send_keys(footnote_content)

        driver.find_element(By.CLASS_NAME, "doc-body").click()
