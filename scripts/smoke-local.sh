#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8080"
echo "=== Gateway health ==="
curl -sf "$BASE/actuator/health" | head -c 200; echo
echo ""
echo "=== Jobs list ==="
curl -sf "$BASE/api/v1/jobs?size=3" | head -c 400; echo
echo ""
echo "=== Autocomplete (positions) ==="
curl -sf "$BASE/api/v1/search/autocomplete/positions?q=web" | head -c 200; echo
echo ""
echo "=== Search ==="
curl -sf "$BASE/api/v1/search/jobs?city=Izmir&size=3" | head -c 400; echo
echo ""
echo "=== Agent chat (anon) ==="
curl -sf -X POST "$BASE/api/v1/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"smoke","message":"Find web dev jobs in Izmir"}' | head -c 600; echo
echo ""
echo "=== ALL OK ==="
