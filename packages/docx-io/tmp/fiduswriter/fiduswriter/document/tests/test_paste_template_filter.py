import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from testing.channels_patch import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper
from django.test import override_settings

from document.models import DocumentTemplate


MAIL_STORAGE_NAME = "paste_template_filter"


@override_settings(MAIL_STORAGE_NAME=MAIL_STORAGE_NAME)
@override_settings(EMAIL_BACKEND="testing.mail.EmailBackend")
class PasteTemplateFilterTest(SeleniumHelper, ChannelsLiveServerTestCase):
    """
    Test that pasting respects document template restrictions on allowed elements.
    """

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
        self.user = self.create_user(
            username="TestUser", email="test@example.com", passtext="testpass"
        )
        return super().setUp()

    def tearDown(self):
        self.driver.execute_script("window.localStorage.clear()")
        self.driver.execute_script("window.sessionStorage.clear()")
        super().tearDown()

    def create_restricted_template(self):
        """
        Create a document template that only allows paragraphs and heading1,
        with only strong and em marks allowed.
        """
        template = DocumentTemplate.objects.create(
            title="Restricted Template",
            import_id="restricted-template",
            content={
                "type": "doc",
                "attrs": {
                    "template": "Restricted Template",
                    "import_id": "restricted-template",
                },
                "content": [
                    {"type": "title"},
                    {
                        "type": "richtext_part",
                        "attrs": {
                            "title": "Body",
                            "id": "body",
                            "elements": ["paragraph", "heading1"],
                            "marks": ["strong", "em"],
                        },
                        "content": [{"type": "paragraph"}],
                    },
                ],
            },
            doc_version="3.5",
            user=self.user,
        )
        return template

    def login_and_create_document(self, template_id=None):
        """Helper to login and create a new document."""
        self.driver.get(self.base_url)
        self.driver.find_element(By.ID, "id-login").send_keys("TestUser")
        self.driver.find_element(By.ID, "id-password").send_keys("testpass")
        self.driver.find_element(By.ID, "login-submit").click()

        if template_id:
            WebDriverWait(self.driver, self.wait_time).until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, ".new_document div.dropdown")
                )
            )

            # Navigate to create document with specific template
            self.driver.get(f"{self.base_url}/document/t{template_id}/")
        else:
            WebDriverWait(self.driver, self.wait_time).until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, ".new_document button")
                )
            )
            self.driver.find_element(
                By.CSS_SELECTOR, ".new_document button"
            ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )

    def paste_html_content(self, html_content):
        """
        Paste HTML content into the editor by executing JavaScript.
        This simulates a paste operation.
        """
        # Focus on the body editor
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        time.sleep(2)
        self.driver.find_element(By.CSS_SELECTOR, ".doc-body").click()
        time.sleep(0.5)

        # Use JavaScript to simulate paste with HTML content
        self.driver.execute_script(
            """
            const editor = document.querySelector('.doc-body');
            const event = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true
            });
            event.clipboardData.setData('text/html', arguments[0]);
            editor.dispatchEvent(event);
        """,
            html_content,
        )

        time.sleep(1)  # Wait for paste to be processed

    def get_body_html(self):
        """Get the HTML content of the document body."""
        return self.driver.execute_script(
            """
            return document.querySelector('.doc-body').innerHTML;
        """
        )

    def test_paste_with_disallowed_table(self):
        """Test that pasting a table when tables are not allowed filters it out."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # HTML with a table (not allowed in restricted template)
        html_with_table = """
        <p>Before table</p>
        <table>
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
            <tr><td>Cell 3</td><td>Cell 4</td></tr>
        </table>
        <p>After table</p>
        """

        self.paste_html_content(html_with_table)

        body_html = self.get_body_html()

        # Table should not be present
        self.assertNotIn("<table", body_html.lower())
        # But the text content should be converted to paragraphs
        self.assertIn("Before table", body_html)
        self.assertIn("After table", body_html)

    def test_paste_with_disallowed_heading_levels(self):
        """Test that pasting h2-h6 headings converts them to allowed elements."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # HTML with various heading levels (only h1 allowed in restricted template)
        html_with_headings = """
        <h1>Allowed Heading 1</h1>
        <h2>Disallowed Heading 2</h2>
        <h3>Disallowed Heading 3</h3>
        <p>Regular paragraph</p>
        """

        self.paste_html_content(html_with_headings)

        body_html = self.get_body_html()

        # H1 should be present
        self.assertIn("Allowed Heading 1", body_html)
        # H2 and H3 should be converted to paragraphs
        self.assertNotIn("<h2", body_html.lower())
        self.assertNotIn("<h3", body_html.lower())
        # But their content should still be there
        self.assertIn("Disallowed Heading 2", body_html)
        self.assertIn("Disallowed Heading 3", body_html)

    def test_paste_with_disallowed_lists(self):
        """Test that pasting lists when lists are not allowed filters them out."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # HTML with lists (not allowed in restricted template)
        html_with_lists = """
        <p>Before list</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
        <ol>
            <li>Numbered 1</li>
            <li>Numbered 2</li>
        </ol>
        <p>After list</p>
        """

        self.paste_html_content(html_with_lists)

        body_html = self.get_body_html()

        # Lists should not be present
        self.assertNotIn("<ul", body_html.lower())
        self.assertNotIn("<ol", body_html.lower())
        self.assertNotIn("<li", body_html.lower())
        # Text should be preserved
        self.assertIn("Before list", body_html)
        self.assertIn("After list", body_html)

    def test_paste_with_disallowed_marks(self):
        """Test that pasting disallowed inline formatting is filtered out."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # HTML with various marks (only strong and em allowed in restricted template)
        html_with_marks = """
        <p>Text with <strong>bold</strong> and <em>italic</em> which are allowed.</p>
        <p>Text with <u>underline</u> and <a href="http://example.com">link</a> which are not allowed.</p>
        """

        self.paste_html_content(html_with_marks)

        body_html = self.get_body_html()

        # Strong and em should be present
        self.assertIn("bold", body_html)
        self.assertIn("italic", body_html)
        # Underline and link tags should not be present
        self.assertNotIn("<u>", body_html.lower())
        self.assertNotIn("<a ", body_html.lower())
        # But their text content should be preserved
        self.assertIn("underline", body_html)
        self.assertIn("link", body_html)

    def test_paste_allowed_content(self):
        """Test that pasting allowed content works normally."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # HTML with only allowed elements and marks
        html_allowed = """
        <h1>Main Heading</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <p>Another paragraph.</p>
        """

        self.paste_html_content(html_allowed)

        body_html = self.get_body_html()

        # All content should be preserved
        self.assertIn("Main Heading", body_html)
        self.assertIn("bold", body_html)
        self.assertIn("italic", body_html)
        self.assertIn("Another paragraph", body_html)

    def test_paste_in_standard_template(self):
        """Test that pasting in standard template (no restrictions) allows everything."""
        # Use standard template (fixture id=1)
        self.login_and_create_document()

        # HTML with various elements
        html_content = """
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <p>Paragraph with <strong>bold</strong>, <em>italic</em>, and <a href="#">link</a>.</p>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
        </ul>
        <table>
            <tr><td>Cell</td></tr>
        </table>
        """

        self.paste_html_content(html_content)

        body_html = self.get_body_html()

        # In standard template, most elements should be allowed
        self.assertIn("Heading 1", body_html)
        self.assertIn("Heading 2", body_html)
        self.assertIn("List item", body_html)

    def test_paste_mixed_content(self):
        """Test pasting mixed content with both allowed and disallowed elements."""
        template = self.create_restricted_template()
        self.login_and_create_document(template.id)

        # Complex HTML with mix of allowed and disallowed content
        html_mixed = """
        <h1>Allowed Heading</h1>
        <p>Allowed paragraph with <strong>bold</strong>.</p>
        <blockquote>Disallowed blockquote</blockquote>
        <p>Another <em>allowed</em> paragraph.</p>
        <ul>
            <li>Disallowed list item</li>
        </ul>
        <h2>Disallowed h2</h2>
        """

        self.paste_html_content(html_mixed)

        body_html = self.get_body_html()
        # Allowed content should be present
        self.assertIn("Allowed Heading", body_html)
        self.assertIn("<h1", body_html)
        self.assertIn("bold", body_html)
        self.assertIn("<strong", body_html)
        # Disallowed elements should not be present
        self.assertNotIn("<blockquote", body_html.lower())
        self.assertNotIn("<ul", body_html.lower())
        self.assertNotIn("<h2", body_html.lower())
        # But text content should be preserved
        self.assertIn("Disallowed blockquote", body_html)
        self.assertIn("Disallowed list item", body_html)
        self.assertIn("Disallowed h2", body_html)
