import os
import json
from copy import deepcopy

from prosemirror.model import Node, Schema
from prosemirror.transform import Step

from django.conf import settings

schema_json_path = os.path.join(
    settings.PROJECT_PATH, "static-libs/json/schema.json"
)

if os.path.exists(schema_json_path):
    with open(schema_json_path) as schema_file:
        schema = Schema(json.loads(schema_file.read()))
else:
    schema = None


def from_json(json):
    return Node.from_json(schema, json)


def apply(steps, node):
    for step_obj in steps:
        step = Step.from_json(schema, step_obj)
        step_result = step.apply(node)
        if step_result.ok:
            node = step_result.doc
        else:
            return False
    return node


def to_mini_json(node):
    # Similar to the ProseMirror internal toJSON function,
    # but leaving out attributes that have default values and dealing with
    # attributes that are objects.
    # Adapted from https://github.com/ProseMirror/prosemirror-model/blob/
    # 6d970507cd0da48653d3b72f2731a71a144a364b/src/node.js#L340-L351
    obj = {"type": node.type.name}
    if node.type.name == "doc":
        obj["attrs"] = deepcopy(node.attrs)
    else:
        for attr in node.attrs:
            if node.type.attrs[attr].default != node.attrs[attr]:
                if "attrs" not in obj:
                    obj["attrs"] = {}
                obj["attrs"][attr] = deepcopy(node.attrs[attr])
    if getattr(node.content, "size", None):
        obj["content"] = list(map(to_mini_json, node.content.content))
    if len(node.marks):
        obj["marks"] = list(map(to_mini_mark_json, node.marks))
    if hasattr(node, "text"):
        obj["text"] = node.text
    return obj


def to_mini_mark_json(mark):
    # Adapted from https://github.com/ProseMirror/prosemirror-model/blob/
    # 6d970507cd0da48653d3b72f2731a71a144a364b/src/mark.js#L76-L83
    obj = {"type": mark.type.name}
    for attr in mark.attrs:
        if mark.type.attrs[attr].default != mark.attrs[attr]:
            if "attrs" not in obj:
                obj["attrs"] = {}
            obj["attrs"][attr] = deepcopy(mark.attrs[attr])
    return obj
