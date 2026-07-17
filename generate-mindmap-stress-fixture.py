#!/usr/bin/env python3
"""Generate a deterministic, image-free MindMap Project ZIP for stress testing.

The generated map deliberately looks systematic rather than human-authored.  It
lets us measure canvas/connector performance without accidentally treating
synthetic labels as Buddhist study data.
"""

from __future__ import annotations

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "test-fixtures" / "mindmap-ai-stress-1000.zip"
TOTAL_CHAPTERS = 25
SECTIONS_PER_CHAPTER = 3
LEAVES_PER_SECTION = 12


def px(value: float) -> str:
    return f"{value:g}px"


def make_node(node_id: str, x: float, y: float, title: str, description: str, note: str = "") -> dict:
    return {
        "id": node_id,
        "x": px(x),
        "y": px(y),
        "bg": "",
        "fg": "",
        "bd": "",
        "shape": "box",
        "fs": "",
        "dfs": "",
        "txt": title,
        "desc": description,
        "note": note,
        "type": "n",
    }


def make_line(line_id: int, node_a: str, node_b: str) -> dict:
    return {"id": f"stress_l_{line_id:04d}", "n1": node_a, "n2": node_b, "arrow": "none"}


def build_state() -> dict:
    nodes: list[dict] = []
    lines: list[dict] = []
    line_id = 0

    # 5 x 5 chapters.  Each chapter has one root, three sections, and twelve
    # leaves per section: 25 * (1 + 3 + 3 * 12) = exactly 1,000 nodes.
    for chapter in range(TOTAL_CHAPTERS):
        column, row = chapter % 5, chapter // 5
        base_x = 420 + column * 1560
        base_y = 420 + row * 1320
        chapter_id = f"n{len(nodes)}"
        chapter_no = chapter + 1
        nodes.append(
            make_node(
                chapter_id,
                base_x + 650,
                base_y,
                f"กลุ่มทดสอบ {chapter_no:02d}",
                "ข้อมูลสังเคราะห์สำหรับทดสอบ MindMap",
                "🧪 หมายเหตุสังเคราะห์\nชุดนี้สร้างจากแม่แบบเดียวกันเพื่อทดสอบความเร็ว ไม่ใช่ข้อมูลการศึกษา",
            )
        )

        for section in range(SECTIONS_PER_CHAPTER):
            section_id = f"n{len(nodes)}"
            section_no = section + 1
            section_x = base_x + 70 + section * 500
            section_y = base_y + 260
            nodes.append(
                make_node(
                    section_id,
                    section_x,
                    section_y,
                    f"หมวด {chapter_no:02d}.{section_no}",
                    "กลุ่มย่อยแบบโครงสร้างสม่ำเสมอ",
                )
            )
            lines.append(make_line(line_id, chapter_id, section_id))
            line_id += 1

            for leaf in range(LEAVES_PER_SECTION):
                leaf_id = f"n{len(nodes)}"
                leaf_no = leaf + 1
                leaf_x = section_x - 90 + (leaf % 3) * 165
                leaf_y = base_y + 430 + (leaf // 3) * 145
                note = ""
                if (chapter * SECTIONS_PER_CHAPTER * LEAVES_PER_SECTION + section * LEAVES_PER_SECTION + leaf) % 20 == 0:
                    note = (
                        "🧪 Note สังเคราะห์สำหรับทดสอบ Find\n"
                        "ข้อความนี้มีไว้ตรวจการค้นหา การเปิด Note และการเลื่อนหลายบรรทัด"
                    )
                nodes.append(
                    make_node(
                        leaf_id,
                        leaf_x,
                        leaf_y,
                        f"ข้อมูล {chapter_no:02d}-{section_no}-{leaf_no:02d}",
                        "Node จำลองเพื่อทดสอบการวาดและลาก",
                        note,
                    )
                )
                lines.append(make_line(line_id, section_id, leaf_id))
                line_id += 1

    assert len(nodes) == 1000, len(nodes)
    assert len(lines) == 975, len(lines)

    annotations = {
        "lines": [
            {"id": f"stress_divider_{column}", "x1": 355 + column * 1560, "y1": 180, "x2": 355 + column * 1560, "y2": 6900, "color": "var(--c9)"}
            for column in range(1, 5)
        ],
        "texts": [
            {
                "id": "stress_title",
                "x": 440,
                "y": 100,
                "text": "🧪 AI Stress Test — 1,000 nodes",
                "description": "ข้อมูลสังเคราะห์แบบเป็นระเบียบ เพื่อทดสอบความเร็วของกราฟ ไม่ใช่ข้อมูลจริง",
                "color": "var(--c9)",
                "fontSize": 32,
            }
        ]
        + [
            {
                "id": f"stress_column_{column + 1}",
                "x": 500 + column * 1560,
                "y": 240,
                "text": f"คอลัมน์ทดสอบ {column + 1}",
                "description": "โครงสร้างแม่แบบ 5 × 5",
                "color": "var(--c9)",
                "fontSize": 22,
            }
            for column in range(5)
        ],
    }
    return {
        "nodes": nodes,
        "lines": lines,
        "images": [],
        "annotations": annotations,
        "nid": len(nodes),
        "views": {"cx": 300, "cy": 50, "zoom": 0.13},
    }


def main() -> None:
    state = build_state()
    manifest = {
        "format": "mindmap-project",
        "formatVersion": 1,
        "app": "MindMap",
        "appVersion": "3.90",
        "createdAt": "2026-07-17T00:00:00.000Z",
        "assets": [],
        "fixture": {
            "kind": "synthetic-ai-stress-test",
            "nodeCount": len(state["nodes"]),
            "lineCount": len(state["lines"]),
            "purpose": "Test graph rendering and interaction without image assets.",
        },
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        archive.writestr("mindmap.json", json.dumps(state, ensure_ascii=False, separators=(",", ":")))
    print(f"Created {OUTPUT}")
    print(f"nodes={len(state['nodes'])} lines={len(state['lines'])} images={len(state['images'])}")


if __name__ == "__main__":
    main()
