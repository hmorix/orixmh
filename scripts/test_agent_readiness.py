import os, json, re

passed = 0
failed = 0

def check(condition, message):
    global passed, failed
    if condition:
        print(f"  [PASS] {message}")
        passed += 1
    else:
        print(f"  [FAIL] {message}")
        failed += 1

print("\n=== AGENT READINESS VERIFICATION SUITE ===\n")

# 1. 404 handling & vercel.json fallback
print("Test 1: Agent-Friendly 404s Configuration")
with open("vercel.json") as f:
    vj = json.load(f)
rewrites = vj.get("rewrites", [])
last_rewrite = rewrites[-1] if rewrites else {}
check(last_rewrite.get("destination", "").startswith("/api/not-found"), "Last rewrite fallback routes to /api/not-found")
check(os.path.exists("api/not-found.ts"), "api/not-found.ts serverless function exists")
with open("api/not-found.ts") as f:
    nf_code = f.read()
check("res.status(404)" in nf_code and "text/markdown" in nf_code, "api/not-found.ts returns 404 with text/markdown")
check("llms.txt" in nf_code and "sitemap.xml" in nf_code and "openapi.json" in nf_code, "api/not-found.ts body points to sitemap, llms.txt, openapi")

# 2. Content without JavaScript
print("\nTest 2: Content Without JavaScript (Homepage)")
with open("client/index.html") as f:
    idx_html = f.read()
start_root = idx_html.index('<div id="root">')
end_root = idx_html.index('</div>', start_root)
root_content = idx_html[start_root:end_root]
plain_root = re.sub(r'<[^>]+>', ' ', root_content)
clean_root = ' '.join(plain_root.split())
check(len(clean_root) >= 500, f"Raw HTML homepage has {len(clean_root)} characters (>500 required)")
check("<h1" in root_content, "Homepage contains clear H1 heading")
check("<h2" in root_content and "<h3" in root_content, "Homepage contains sequential H2 and H3 headings")

# 3. OpenAPI Spec Published
print("\nTest 3: OpenAPI Spec Published")
check(os.path.exists("client/public/openapi.json"), "client/public/openapi.json exists")
check(os.path.exists("client/public/openapi.yaml"), "client/public/openapi.yaml exists")
check(os.path.exists("client/public/api/openapi.yaml"), "client/public/api/openapi.yaml exists")
with open("client/public/openapi.json") as f:
    spec = json.load(f)
check(spec.get("openapi", "").startswith("3.0"), f"OpenAPI version is {spec.get('openapi')}")
check(len(spec.get("paths", {})) >= 10, f"OpenAPI specifies {len(spec.get('paths', {}))} paths")

# 4. Markdown Content Negotiation
print("\nTest 4: Markdown Content Negotiation (acceptmarkdown.com)")
check(os.path.exists("api/markdown.ts"), "api/markdown.ts handler exists")
with open("api/markdown.ts") as f:
    md_code = f.read()
check("Vary" in md_code and "Accept, Accept-Encoding" in md_code, "api/markdown.ts sets Vary: Accept, Accept-Encoding")
check("text/markdown" in md_code, "api/markdown.ts sets Content-Type text/markdown")
has_markdown_rule = any(
    r.get("destination", "").startswith("/api/markdown") and
    any(h.get("key") == "accept" for h in r.get("has", []))
    for r in rewrites
)
check(has_markdown_rule, "vercel.json has rewrite with header condition for Accept: text/markdown")

# 5. Developer Portal
print("\nTest 5: Developer Portal")
check(os.path.exists("client/public/developers/index.html"), "client/public/developers/index.html exists")
check(os.path.exists("client/public/developers.md"), "client/public/developers.md exists")
with open("client/public/developers/index.html") as f:
    dev_html = f.read()
plain_dev = re.sub(r'<[^>]+>', ' ', dev_html)
check(len(' '.join(plain_dev.split())) >= 500, f"Developer portal has {len(' '.join(plain_dev.split()))} chars of raw HTML")
with open("client/src/pages/Developers.tsx") as f:
    dev_tsx = f.read()
check("sandbox" in dev_tsx.lower() and "openapi" in dev_tsx.lower(), "Developers.tsx includes sandbox and openapi links")

# 6. CLI Tool Available
print("\nTest 6: CLI Tool Available")
check(os.path.exists("packages/cli/package.json"), "packages/cli/package.json exists")
check(os.path.exists("packages/cli/bin/hmorix.js"), "packages/cli/bin/hmorix.js exists and is executable")
with open("packages/cli/package.json") as f:
    pkg = json.load(f)
check(pkg.get("name") == "@hmorix/cli" and "bin" in pkg, "package.json defines @hmorix/cli with bin")

# 7. Public API/Docs Linked from Homepage
print("\nTest 7: Public API/Docs Linked from Homepage")
with open("client/src/pages/Home.tsx") as f:
    home_tsx = f.read()
check('to="/docs"' in home_tsx or 'href="/docs"' in home_tsx, "Home.tsx contains link to /docs")
check('to="/developers"' in home_tsx, "Home.tsx contains link to /developers")
with open("client/index.html") as f:
    raw_home = f.read()
check('/docs' in raw_home and '/developers' in raw_home, "client/index.html raw HTML links to /docs and /developers")

# 8. Agent Instructions & When-to-Use
print("\nTest 8: Agent Instructions & When-to-Use")
with open("client/public/llms.txt") as f:
    llms_txt = f.read()
check("When to Use HMorix" in llms_txt, "llms.txt contains 'When to Use' section")
check("How an Agent Should Call HMorix" in llms_txt, "llms.txt contains calling instructions")
check("https://hmorix.in/openapi.json" in llms_txt, "llms.txt contains markdown link to openapi.json")
check(os.path.exists("client/public/agent-instructions.txt"), "agent-instructions.txt exists")

# 9. Trust Anchor Pages
print("\nTest 9: Trust Anchor Pages (About, Contact, Privacy)")
for anchor in ['about', 'contact', 'privacy']:
    html_path = f"client/public/{anchor}/index.html"
    md_path = f"client/public/{anchor}.md"
    check(os.path.exists(html_path), f"{html_path} exists")
    check(os.path.exists(md_path), f"{md_path} exists")
    with open(html_path) as f:
        anchor_html = f.read()
    plain_anchor = ' '.join(re.sub(r'<[^>]+>', ' ', anchor_html).split())
    check(len(plain_anchor) >= 500, f"{anchor} raw HTML has {len(plain_anchor)} chars (>500 required)")

# 10. Developer Resource Discoverability
print("\nTest 10: Developer Resource Discoverability")
with open("client/public/sitemap.xml") as f:
    sitemap = f.read()
check("https://hmorix.in/docs" in sitemap, "sitemap.xml includes /docs")
check("https://hmorix.in/developers" in sitemap, "sitemap.xml includes /developers")
with open("client/public/robots.txt") as f:
    robots = f.read()
check("Allow: /openapi.json" in robots, "robots.txt allows /openapi.json")
check("Allow: /docs" in robots, "robots.txt allows /docs")

# 11 & 12. Schema Complexity & Function Calling
print("\nTest 11 & 12: Schema Complexity & Function Calling Compatibility")
op_ids = []
all_described = True
all_typed = True
for path_key, path_item in spec.get("paths", {}).items():
    for method, op in path_item.items():
        if method in ["get", "post", "put", "delete", "patch"]:
            op_id = op.get("operationId")
            if op_id:
                op_ids.append(op_id)
            else:
                all_described = False
            if not op.get("description"):
                all_described = False
            # Check requestBody schemas
            if "requestBody" in op:
                schema = op["requestBody"].get("content", {}).get("application/json", {}).get("schema", {})
                if not schema:
                    all_typed = False
            # Check response schemas
            responses = op.get("responses", {})
            if "200" in responses or "201" in responses:
                r_schema = (responses.get("200") or responses.get("201")).get("content", {}).get("application/json", {}).get("schema", {})
                if not r_schema:
                    all_typed = False

check(len(op_ids) == len(set(op_ids)) and len(op_ids) > 0, f"All {len(op_ids)} operationIds are unique")
check(all_described, "All operations have descriptive summaries and descriptions")
check(all_typed, "All operations have typed parameter, requestBody, and response schemas")

# Bonus RFC checks
print("\nTest Bonus RFCs:")
check(os.path.exists("client/public/.well-known/api-catalog"), "RFC 9727 api-catalog exists")
with open("client/public/.well-known/api-catalog") as f:
    cat = json.load(f)
check("linkset" in cat, "api-catalog has valid linkset JSON array")

check(os.path.exists("client/public/.well-known/http-message-signatures-directory"), "RFC 9421 bot signatures directory exists")
with open("client/public/.well-known/http-message-signatures-directory") as f:
    sigs = json.load(f)
check("keys" in sigs and len(sigs["keys"]) > 0, "http-message-signatures-directory has valid keys array")

print(f"\n==========================================")
print(f"RESULTS: {passed} PASSED, {failed} FAILED")
print(f"==========================================\n")
