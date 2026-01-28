from django.http import JsonResponse
from django.views.decorators.http import require_POST

from base.decorators import ajax_required
from feedback.models import Feedback


@require_POST
@ajax_required
def feedback(request):
    response = {}
    status = 200
    feedback_message = request.POST["message"]
    new_feedback = Feedback()
    new_feedback.message = feedback_message
    if request.user.is_authenticated:
        new_feedback.owner = request.user
    new_feedback.save()

    return JsonResponse(response, status=status)
