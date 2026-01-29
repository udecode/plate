from django.test import TestCase
from django.contrib.contenttypes.models import ContentType
from user.models import User, UserInvite
from document.models import Document, AccessRight, DocumentTemplate


class UserInviteApplyTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1", email="user1@test.com", password="test"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@test.com", password="test"
        )
        # Create a document template
        self.template = DocumentTemplate.objects.create(
            title="Test Template", content={}
        )
        self.doc = Document.objects.create(
            owner=self.user1, title="Test Doc", template=self.template
        )

    def test_apply_transfers_access_right(self):
        """Test that apply() correctly transfers access right from invite to user"""
        # Create a user invite
        invite = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )

        # Create an access right for the invite
        AccessRight.objects.create(
            document=self.doc, holder_obj=invite, rights="write"
        )

        # Get the invite ID before applying
        invite_id = invite.id

        # Apply the invite
        invite.apply()

        # Check that the access right now belongs to user2
        user_ct = ContentType.objects.get_for_model(User)
        ar = AccessRight.objects.filter(
            document=self.doc, holder_type=user_ct, holder_id=self.user2.id
        ).first()

        self.assertIsNotNone(ar)
        self.assertEqual(ar.rights, "write")

        # Check that the invite no longer exists
        self.assertFalse(UserInvite.objects.filter(id=invite_id).exists())

    def test_apply_with_existing_access_right(self):
        """Test that apply() handles case where user already has access"""
        # Create existing access right for user2
        AccessRight.objects.create(
            document=self.doc, holder_obj=self.user2, rights="read"
        )

        # Create a user invite with higher privileges
        invite = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )

        # Create an access right for the invite
        invite_ar = AccessRight.objects.create(
            document=self.doc, holder_obj=invite, rights="write"
        )

        # Get counts before apply
        user_ct = ContentType.objects.get_for_model(User)
        initial_count = AccessRight.objects.filter(
            document=self.doc, holder_type=user_ct, holder_id=self.user2.id
        ).count()
        self.assertEqual(initial_count, 1)

        # Apply the invite
        invite.apply()

        # Check that there's still only one access right for user2
        ars = AccessRight.objects.filter(
            document=self.doc, holder_type=user_ct, holder_id=self.user2.id
        )

        self.assertEqual(ars.count(), 1)
        # Should be upgraded to write
        self.assertEqual(ars.first().rights, "write")

        # Check that the invite's access right was deleted
        self.assertFalse(AccessRight.objects.filter(id=invite_ar.id).exists())

    def test_apply_when_user_owns_document(self):
        """Test that apply() handles case where user owns the document"""
        # Create document owned by user2
        doc2 = Document.objects.create(
            owner=self.user2, title="User2's Doc", template=self.template
        )

        # Create a user invite
        invite = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )

        # Create an access right for the invite
        invite_ar = AccessRight.objects.create(
            document=doc2, holder_obj=invite, rights="write"
        )

        invite_ar_id = invite_ar.id

        # Apply the invite
        invite.apply()

        # Check that the redundant access right was deleted
        self.assertFalse(AccessRight.objects.filter(id=invite_ar_id).exists())

        # Check that no access right was created for user2 (they're the owner)
        user_ct = ContentType.objects.get_for_model(User)
        ars = AccessRight.objects.filter(
            document=doc2, holder_type=user_ct, holder_id=self.user2.id
        )
        self.assertEqual(ars.count(), 0)

    def test_apply_without_valid_user(self):
        """Test that apply() returns early if user is invalid"""
        # Create invite without a 'to' user
        invite = UserInvite.objects.create(
            email="newuser@test.com",
            username="newuser@test.com",
            by=self.user1,
            to=None,
        )

        # Create an access right for the invite
        ar = AccessRight.objects.create(
            document=self.doc, holder_obj=invite, rights="write"
        )

        # Apply should return early without doing anything
        invite.apply()

        # The invite and access right should still exist
        self.assertTrue(UserInvite.objects.filter(id=invite.id).exists())
        self.assertTrue(AccessRight.objects.filter(id=ar.id).exists())

    def test_apply_adds_to_contacts(self):
        """Test that apply() adds users to each other's contacts"""
        # Ensure users are not contacts initially
        self.assertNotIn(self.user2, self.user1.contacts.all())
        self.assertNotIn(self.user1, self.user2.contacts.all())

        # Create and apply invite
        invite = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )

        AccessRight.objects.create(
            document=self.doc, holder_obj=invite, rights="write"
        )

        invite.apply()

        # Check that they are now contacts
        self.assertIn(self.user2, self.user1.contacts.all())
        self.assertIn(self.user1, self.user2.contacts.all())

    def test_apply_multiple_invites_same_document(self):
        """Test that apply() handles multiple invites for the same document correctly"""
        # This simulates the scenario where a user might receive multiple
        # invites for the same document (e.g., shared multiple times)

        # Create first invite with read access
        invite1 = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )
        AccessRight.objects.create(
            document=self.doc, holder_obj=invite1, rights="read"
        )

        # Apply first invite - user2 gets read access
        invite1.apply()

        # Verify user2 has read access
        user_ct = ContentType.objects.get_for_model(User)
        ar = AccessRight.objects.filter(
            document=self.doc, holder_type=user_ct, holder_id=self.user2.id
        ).first()
        self.assertIsNotNone(ar)
        self.assertEqual(ar.rights, "read")

        # Create second invite with write access (upgrade scenario)
        invite2 = UserInvite.objects.create(
            email="user2@test.com",
            username="user2@test.com",
            by=self.user1,
            to=self.user2,
        )
        ar2 = AccessRight.objects.create(
            document=self.doc, holder_obj=invite2, rights="write"
        )

        # Apply second invite - should upgrade to write
        invite2.apply()

        # Verify user2 now has write access and only ONE access right
        ars = AccessRight.objects.filter(
            document=self.doc, holder_type=user_ct, holder_id=self.user2.id
        )
        self.assertEqual(ars.count(), 1)
        self.assertEqual(ars.first().rights, "write")

        # Verify the second invite's access right was properly cleaned up
        self.assertFalse(AccessRight.objects.filter(id=ar2.id).exists())
