"""
Tool registry — maps tool_name → async handler(args, session_id) → dict.
DS-A / FSE-A shared ownership.
"""

from backend.tools.flight_booking import flight_book, flight_search

# from backend.tools.crm import crm_lookup
from backend.tools.general_qa import general_qa
from backend.tools.knowledge import kb_search
from backend.tools.meeting_summarizer import compile_meeting_minutes
from backend.tools.ppt_copilot import (
    ppt_add_slide,
    ppt_clear_presentation,
    ppt_create_slides,
    ppt_delete_slide,
    ppt_edit_slide,
    ppt_improvise_slide,
    ppt_jump_to_title,
    ppt_navigate,
    ppt_qa,
    ppt_summarize,
)
from backend.tools.system_tasks import (
    cancel_task_tool,
    complex_calculation,
    database_query,
    send_email_tool,
    system_check,
    write_email_tool,
    write_file_tool,
)

TOOL_REGISTRY: dict = {
    "ppt_navigate": ppt_navigate,
    "ppt_jump_to_title": ppt_jump_to_title,
    "ppt_summarize": ppt_summarize,
    "ppt_delete_slide": ppt_delete_slide,
    "ppt_qa": ppt_qa,
    "ppt_create_slides": ppt_create_slides,
    "ppt_add_slide": ppt_add_slide,
    "ppt_edit_slide": ppt_edit_slide,
    "ppt_clear_presentation": ppt_clear_presentation,
    "ppt_improvise_slide": ppt_improvise_slide,
    "kb_search": kb_search,
    # "crm_lookup":        crm_lookup,
    "flight_search": flight_search,
    "flight_book": flight_book,
    "general_qa": general_qa,
    "database_query": database_query,
    "write_file": write_file_tool,
    "write_email": write_email_tool,
    "send_email": send_email_tool,
    "system_check": system_check,
    "complex_calculation": complex_calculation,
    "cancel_task": cancel_task_tool,
    "compile_minutes": compile_meeting_minutes,
}
