#!/usr/bin/env python3
import json
import os
import sys

from lib.env import load_env

load_env()

from workflows.daily_blog import run_daily_blog  # noqa: E402
from workflows.weekly_audit import run_weekly_audit  # noqa: E402
from workflows.content_refresh import run_content_refresh  # noqa: E402
from workflows.topic_suggestions import run_topic_suggestions  # noqa: E402
from workflows.keyword_rankings import run_keyword_rankings  # noqa: E402
from workflows.daily_scheduler import run_daily_batch  # noqa: E402
from workflows.case_study_pipeline import run_case_study  # noqa: E402
from workflows.whitepaper_pipeline import run_whitepaper  # noqa: E402
from workflows.press_pipeline import run_press_release  # noqa: E402
from workflows.image_pipeline import generate_social_image_pack  # noqa: E402


def main():
    args = sys.argv[1:]

    if "--now" in args:
        content_type = None
        if "--type" in args:
            idx = args.index("--type")
            if idx + 1 >= len(args):
                print("Usage: python index.py --now --type <blog|tutorial|comparison|landing-page>", file=sys.stderr)
                sys.exit(1)
            content_type = args[idx + 1]
            valid = {"blog", "tutorial", "comparison", "landing-page"}
            if content_type not in valid:
                print(f"--type must be one of {sorted(valid)}, got \"{content_type}\"", file=sys.stderr)
                sys.exit(1)
        seed_topic = "auto"
        if "--topic" in args:
            idx = args.index("--topic")
            if idx + 1 >= len(args):
                print("Usage: python index.py --now --topic \"some topic area\"", file=sys.stderr)
                sys.exit(1)
            seed_topic = args[idx + 1]
        try:
            run_daily_blog(seed_topic=seed_topic, content_type=content_type)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--suggest-topics" in args:
        idx = args.index("--suggest-topics")
        count = 10
        if idx + 1 < len(args) and args[idx + 1].isdigit():
            count = int(args[idx + 1])
        try:
            run_topic_suggestions(count=count)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--check-rankings" in args:
        idx = args.index("--check-rankings")
        # Optional trailing keywords: --check-rankings "kw one" "kw two"
        rest = args[idx + 1:]
        keywords = [a for a in rest if not a.startswith("--")] or None
        try:
            run_keyword_rankings(keywords=keywords)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--daily-schedule" in args:
        try:
            run_daily_batch()
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--web" in args:
        idx = args.index("--web")
        rest = args[idx + 1:]
        port_args = [a for a in rest if a.isdigit()]
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "web_server.py")
        result = subprocess.run([sys.executable, script] + port_args)
        sys.exit(result.returncode)

    elif "--render-page" in args:
        idx = args.index("--render-page")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --render-page <draft.json | --slug X | --all-pending>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "render_page.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--case-study" in args:
        idx = args.index("--case-study")
        if idx + 1 >= len(args):
            print("Usage: python index.py --case-study <input.json> [--words 10000] [--review]", file=sys.stderr)
            sys.exit(1)
        input_path = args[idx + 1]
        with open(input_path, "r", encoding="utf-8") as f:
            case_input = json.load(f)
        case_input.pop("_instructions", None)
        target_words = case_input.pop("target_word_count", 10000)
        if "--words" in args:
            widx = args.index("--words")
            target_words = int(args[widx + 1])
        force_review = "--review" in args
        try:
            run_case_study(case_input, target_word_count=target_words, force_review=force_review)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--render-case-study" in args:
        idx = args.index("--render-case-study")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --render-case-study <draft.json | --slug X | --all-pending>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "case_study_render.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--whitepaper" in args:
        idx = args.index("--whitepaper")
        if idx + 1 >= len(args):
            print("Usage: python index.py --whitepaper <input.json> [--words 6000] [--review]", file=sys.stderr)
            sys.exit(1)
        input_path = args[idx + 1]
        with open(input_path, "r", encoding="utf-8") as f:
            wp_input = json.load(f)
        wp_input.pop("_instructions", None)
        target_words = wp_input.pop("target_word_count", 6000)
        if "--words" in args:
            widx = args.index("--words")
            target_words = int(args[widx + 1])
        force_review = "--review" in args
        try:
            run_whitepaper(wp_input, target_word_count=target_words, force_review=force_review)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--render-whitepaper" in args:
        idx = args.index("--render-whitepaper")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --render-whitepaper <draft.json | --slug X | --all-pending>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "whitepaper_render.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--whitepaper-pdf" in args:
        idx = args.index("--whitepaper-pdf")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --whitepaper-pdf <draft.json>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "whitepaper_pdf.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--press" in args:
        idx = args.index("--press")
        if idx + 1 >= len(args):
            print("Usage: python index.py --press <input.json> [--words 600] [--review]", file=sys.stderr)
            sys.exit(1)
        input_path = args[idx + 1]
        with open(input_path, "r", encoding="utf-8") as f:
            press_input = json.load(f)
        press_input.pop("_instructions", None)
        target_words = press_input.pop("target_word_count", 600)
        if "--words" in args:
            widx = args.index("--words")
            target_words = int(args[widx + 1])
        force_review = "--review" in args
        try:
            run_press_release(press_input, target_word_count=target_words, force_review=force_review)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--render-press" in args:
        idx = args.index("--render-press")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --render-press <draft.json | --slug X | --all-pending>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "press_render.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--press-pdf" in args:
        idx = args.index("--press-pdf")
        rest = args[idx + 1:]
        if not rest:
            print("Usage: python index.py --press-pdf <draft.json>", file=sys.stderr)
            sys.exit(1)
        import subprocess
        script = os.path.join(os.path.dirname(__file__), "scripts", "press_pdf.py")
        result = subprocess.run([sys.executable, script] + rest)
        sys.exit(result.returncode)

    elif "--generate-images" in args:
        idx = args.index("--generate-images")
        if idx + 1 >= len(args):
            print("Usage: python index.py --generate-images \"<prompt>\" [--count 10] [--title \"...\"]", file=sys.stderr)
            sys.exit(1)
        custom_prompt = args[idx + 1]
        count = 10
        if "--count" in args:
            count = int(args[args.index("--count") + 1])
        title = custom_prompt[:60]
        if "--title" in args:
            title = args[args.index("--title") + 1]
        try:
            generate_social_image_pack(title, custom_prompt=custom_prompt, count=count)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--audit" in args:
        try:
            run_weekly_audit()
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    elif "--refresh" in args:
        idx = args.index("--refresh")
        if idx + 1 >= len(args):
            print("Usage: python index.py --refresh <post_id>", file=sys.stderr)
            sys.exit(1)
        post_id = args[idx + 1]
        try:
            run_content_refresh(post_id)
            sys.exit(0)
        except Exception as err:  # noqa: BLE001
            print(err, file=sys.stderr)
            sys.exit(1)

    else:
        print("seo-agent (Python)")
        print()
        print("Usage:")
        print("  python index.py --web [port]                         Launch the local web UI (default port 8787)")
        print("  python index.py --daily-schedule                    Run today's 15-topic batch once, right now")
        print("                       (wire this to cron / termux-job-scheduler for a guaranteed daily run)")
        print("  python index.py --now                                Run the daily blog pipeline once")
        print("  python index.py --now --type tutorial                 Force a specific template")
        print("                       (blog | tutorial | comparison | landing-page)")
        print("  python index.py --now --topic \"AI agents for SaaS\"    Seed a specific topic area")
        print("  python index.py --suggest-topics [n]                 Suggest n blog topics (default 10)")
        print("  python index.py --check-rankings [kw1] [kw2] ...     Check real Google rankings")
        print("                       (with no keywords, checks every keyword on your published posts)")
        print("  python index.py --render-page <draft.json>          Convert a draft/post JSON into a")
        print("                       standalone static HTML page (templates/page-template.html)")
        print("                       Also: --render-page --slug <slug>   |   --render-page --all-pending")
        print("  python index.py --case-study <input.json> [--words N] [--review]")
        print("                       Run the case-study pipeline for one project.")
        print("                       See knowledge/case-study-input-template.json for the input shape.")
        print("                       Default target is 10,000 words; --review leaves it as a draft.")
        print("  python index.py --render-case-study <draft.json>   Standalone HTML for one case study")
        print("                       (templates/case-study-template.html). Also: --slug X | --all-pending")
        print("  python index.py --whitepaper <input.json> [--words N] [--review]")
        print("                       Run the white-paper pipeline: research (real, cited sources via")
        print("                       Google CSE) -> write -> SEO -> PDF -> web page -> publish.")
        print("                       See knowledge/whitepaper-input-template.json. Default target 6,000 words.")
        print("  python index.py --render-whitepaper <draft.json>   Standalone HTML for one white paper")
        print("                       Also: --slug X | --all-pending")
        print("  python index.py --whitepaper-pdf <draft.json>      (Re)generate just the PDF")
        print("                       Requires: pip install reportlab --break-system-packages")
        print("  python index.py --press <input.json> [--words N] [--review]")
        print("                       Run the press-release pipeline. See knowledge/press-input-template.json.")
        print("                       Default target 600 words. Set is_commentary=true to cite other companies.")
        print("  python index.py --render-press <draft.json>   Standalone HTML for one press release")
        print("  python index.py --press-pdf <draft.json>      (Re)generate just the PDF")
        print("  python index.py --generate-images \"<prompt>\" [--count 10] [--title \"...\"]")
        print("                       Free image generation via pollinations.ai (no API key). Also")
        print("                       available in the web UI at /images, which can pull from your")
        print("                       existing content instead of a raw prompt, and adds social captions.")
        print("  python index.py --audit              Run the weekly staleness audit once")
        print("  python index.py --refresh <post_id>  Run the content-refresh workflow for one post")
        print()
        print("Scheduling was intentionally left out of this port — trigger these with")
        print("Termux's crontab (or any external scheduler) instead of a long-running process, e.g.:")
        print("  0 6 * * *   cd ~/seo-agent && python index.py --now")
        print("  0 7 * * 1   cd ~/seo-agent && python index.py --audit")


if __name__ == "__main__":
    main()
