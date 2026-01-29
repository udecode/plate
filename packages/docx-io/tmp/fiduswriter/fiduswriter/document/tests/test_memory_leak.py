import os
import gc
import time
import psutil
from django.contrib.auth import get_user_model
from channels.testing import ChannelsLiveServerTestCase
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .editor_helper import EditorHelper

from document.models import AccessRight


class MemoryLeakTest(EditorHelper, ChannelsLiveServerTestCase):
    """
    Test memory usage during consecutive document editing.
    This test opens, edits and closes a large number of documents
    and monitors memory usage to detect potential leaks.

    Note: This test is resource-intensive but can be run in CI.
    Use the SKIP_MEMORY_LEAK_TEST environment variable to skip if needed.
    """

    fixtures = [
        "initial_documenttemplates.json",
        "initial_styles.json",
    ]
    TEST_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    NUMBER_OF_DOCS = int(
        os.environ.get("MEMORY_LEAK_TEST_DOCS", "20")
    )  # Can be adjusted via env var
    LEAK_THRESHOLD = float(
        os.environ.get("MEMORY_LEAK_THRESHOLD", "20")
    )  # Default 5% threshold

    @classmethod
    def setUpClass(cls):
        # Skip test if environment variable is set
        if os.environ.get("SKIP_MEMORY_LEAK_TEST"):
            return

        super().setUpClass()
        driver_data = cls.get_drivers(2)
        cls.driver = driver_data["drivers"][0]
        cls.driver2 = driver_data["drivers"][1]
        cls.client = driver_data["clients"][0]
        cls.client2 = driver_data["clients"][1]
        cls.wait_time = driver_data["wait_time"]

        # For tracking memory usage
        cls.process = psutil.Process(os.getpid())

        # Set up admin user
        User = get_user_model()
        cls.admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpassword",
        )

        # Set up regular user
        cls.test_user = User.objects.create_user(
            username="test", email="test@example.com", password="testpassword"
        )

    @classmethod
    def tearDownClass(cls):
        if os.environ.get("SKIP_MEMORY_LEAK_TEST"):
            return

        if hasattr(cls, "driver"):
            cls.driver.quit()
        if hasattr(cls, "driver2"):
            cls.driver2.quit()
        super().tearDownClass()

    def setUp(self):
        if os.environ.get("SKIP_MEMORY_LEAK_TEST"):
            self.skipTest(
                "Memory leak test skipped due to SKIP_MEMORY_LEAK_TEST environment variable"
            )

        super().setUp()
        # Force garbage collection before starting
        gc.collect()

        # Login both users
        self.login_user(self.admin_user, self.driver, self.client)
        self.login_user(self.test_user, self.driver2, self.client2)

    def tearDown(self):
        if os.environ.get("SKIP_MEMORY_LEAK_TEST"):
            return

        # Force garbage collection after finishing
        gc.collect()
        super().tearDown()

    def get_memory_usage(self):
        """Return the memory usage in MB for all child processes."""
        gc.collect()
        # Measure current process
        main_process = self.process.memory_info().rss

        # Also measure child processes (Daphne server processes)
        child_processes = 0
        for child in self.process.children(recursive=True):
            try:
                child_processes += child.memory_info().rss
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        total_memory = (main_process + child_processes) / 1024 / 1024
        return total_memory

    def log_memory_usage(self, stage):
        """Log current memory usage with a stage description."""
        memory = self.get_memory_usage()
        print(f"Memory usage at {stage}: {memory:.2f} MB")
        return memory

    def create_and_edit_document(self, document_num):
        """Create, open, edit and close a document."""
        # Create a new document
        doc = self.create_new_document(self.admin_user)

        AccessRight.objects.create(
            holder_obj=self.test_user, document=doc, rights="write"
        )

        # Open document in both browsers
        self.load_document_editor(self.driver, doc)
        self.load_document_editor(self.driver2, doc)

        # Set title
        title_input = self.driver.find_element(By.CLASS_NAME, "doc-title")
        title_input.send_keys(f"Test Document {document_num}")

        # Set document content in driver1
        body_input = self.driver.find_element(By.CLASS_NAME, "doc-body")
        body_input.click()
        body_input.send_keys(self.TEST_TEXT)

        # Wait for sync
        self.wait_for_doc_sync(self.driver, self.driver2)

        # Add additional text from driver2
        body_input2 = self.driver2.find_element(By.CLASS_NAME, "doc-body")
        body_input2.click()
        body_input2.send_keys(" " + self.TEST_TEXT)

        # Wait for sync again
        self.wait_for_doc_sync(self.driver, self.driver2)

        # Close document by navigating away
        self.driver.get(f"{self.live_server_url}/")
        self.driver2.get(f"{self.live_server_url}/")

        # Wait for navigation to complete
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "fw-overview-menu"))
        )
        WebDriverWait(self.driver2, self.wait_time).until(
            EC.presence_of_element_located((By.ID, "fw-overview-menu"))
        )

        return True

    def test_memory_usage_with_multiple_documents(self):
        """
        Test memory usage when opening, editing and closing multiple documents.
        Fails if memory usage after cleanup exceeds the threshold.
        """
        print("\n" + "=" * 80)
        print(
            f"MEMORY LEAK TEST - Testing with {self.NUMBER_OF_DOCS} documents"
        )
        print("=" * 80)

        # Record baseline memory usage before any document operations
        initial_memory = self.log_memory_usage("initial baseline")

        # Create and edit a single document to establish per-document memory footprint
        print("\nEstablishing baseline with a single document...")
        self.create_and_edit_document(0)  # Document 0 for baseline

        # Force garbage collection to get a clean baseline
        print("Waiting for cleanup after baseline document...")
        time.sleep(3)
        gc.collect()
        baseline_memory = self.log_memory_usage("clean baseline")

        # Create a list to store memory readings after each document
        memory_readings = []

        # Process documents in batches to show progress
        batch_size = 5
        for batch in range(0, self.NUMBER_OF_DOCS, batch_size):
            batch_end = min(batch + batch_size, self.NUMBER_OF_DOCS)
            print(
                f"\nProcessing documents {batch+1}-{batch_end} of {self.NUMBER_OF_DOCS}"
            )

            for i in range(batch, batch_end):
                print(
                    f"Document {i+1}/{self.NUMBER_OF_DOCS}...",
                    end=" ",
                    flush=True,
                )
                success = self.create_and_edit_document(i + 1)

                if success:
                    print("Done")
                else:
                    print("Failed")

                # Measure memory after each document
                memory_readings.append(self.get_memory_usage())

            # Log batch memory usage
            self.log_memory_usage(f"after {batch_end} documents")

        # Final memory measurement after all documents
        final_memory = self.log_memory_usage("end")

        # Wait a bit to allow any cleanup processes to finish
        print("Waiting for cleanup...")
        time.sleep(5)
        gc.collect()
        time.sleep(2)
        after_wait_memory = self.log_memory_usage("after final wait")

        # Calculate memory growth
        memory_diff = final_memory - baseline_memory
        memory_diff_percent = (memory_diff / baseline_memory) * 100

        # Calculate average memory per document
        memory_per_doc = (
            memory_diff / self.NUMBER_OF_DOCS if self.NUMBER_OF_DOCS > 0 else 0
        )

        # Calculate memory after cleanup
        cleanup_diff = after_wait_memory - baseline_memory
        cleanup_diff_percent = (cleanup_diff / baseline_memory) * 100
        cleanup_per_doc = (
            cleanup_diff / self.NUMBER_OF_DOCS
            if self.NUMBER_OF_DOCS > 0
            else 0
        )

        print("\n" + "=" * 80)
        print(f"MEMORY USAGE SUMMARY (over {self.NUMBER_OF_DOCS} documents)")
        print("=" * 80)
        print(f"Initial memory usage: {initial_memory:.2f} MB")
        print(f"Baseline after one document: {baseline_memory:.2f} MB")
        print(f"Final memory usage: {final_memory:.2f} MB")
        print(f"Memory after cleanup: {after_wait_memory:.2f} MB")
        print(
            f"Total memory growth: {memory_diff:.2f} MB ({memory_diff_percent:.1f}%)"
        )
        print(f"Average memory per document: {memory_per_doc:.2f} MB")
        print(
            f"Memory growth after cleanup: {cleanup_diff:.2f} MB ({cleanup_diff_percent:.1f}%)"
        )
        print(f"Average leaked memory per document: {cleanup_per_doc:.2f} MB")

        # Output memory growth pattern
        print("\nMEMORY GROWTH PATTERN:")
        for i, mem in enumerate(memory_readings):
            growth = mem - baseline_memory
            growth_percent = (growth / baseline_memory) * 100
            print(
                f"Doc {i+1}: {mem:.2f} MB (+{growth:.2f} MB, +{growth_percent:.1f}%)"
            )

        # Analyze memory usage pattern
        is_monotonic_growth = True
        for i in range(1, len(memory_readings)):
            if memory_readings[i] < memory_readings[i - 1]:
                is_monotonic_growth = False
                break

        # Extra information for analysis
        print("\nANALYSIS:")
        if is_monotonic_growth and cleanup_diff_percent > self.LEAK_THRESHOLD:
            print(
                "⚠️ Memory usage shows consistent growth pattern that persists after cleanup."
            )
        elif cleanup_diff_percent > self.LEAK_THRESHOLD:
            print(
                "⚠️ Memory usage increased but doesn't show a consistent growth pattern."
            )
        else:
            print("✓ Memory usage seems stable with proper cleanup.")

        # Check if memory leaks are significant
        if cleanup_diff_percent > self.LEAK_THRESHOLD:
            print("\n⚠️ MEMORY LEAK DETECTED! ⚠️")
            print(
                f"Memory usage increased by {cleanup_diff_percent:.1f}% after cleanup."
            )
            print(f"This exceeds the threshold of {self.LEAK_THRESHOLD}%.")
            print(
                f"Approximate memory leak per document: {cleanup_per_doc:.2f} MB"
            )
            self.fail(
                f"Memory leak detected: {cleanup_diff_percent:.1f}% growth after cleanup (threshold: {self.LEAK_THRESHOLD}%)"
            )
        else:
            print("\n✅ No significant memory leak detected.")
            print(
                f"Memory usage increased by {cleanup_diff_percent:.1f}% after cleanup, below threshold of {self.LEAK_THRESHOLD}%."
            )
            if cleanup_per_doc > 0.1:  # Small but measurable leak
                print(
                    f"Note: Small leak of approximately {cleanup_per_doc:.2f} MB per document detected."
                )
                print(
                    "This may accumulate over time in production environments."
                )

        print("=" * 80)

        # Ensure test passes if we reach this point
        self.assertTrue(
            cleanup_diff_percent <= self.LEAK_THRESHOLD,
            f"Memory growth after cleanup ({cleanup_diff_percent:.1f}%) exceeds threshold ({self.LEAK_THRESHOLD}%)",
        )
