# Security Incident Response

## Incident Response Lifecycle (NIST SP 800-61)

1. **Preparation**: IR plan, playbooks, tooling, training, communication trees
2. **Detection & Analysis**: Alert triage, IOCs, telemetry analysis, confirm compromise
3. **Containment, Eradication & Recovery**: Isolate, remove threat, restore systems
4. **Post-Incident Activity**: Lessons learned, report, control improvements

## IR Team Structure (Tiered)

- **Tier 1 — Triage**: SOC analysts, initial alert handling, false positive filtering, severity scoring
- **Tier 2 — Analysis**: Deep investigation, log/forensic analysis, containment execution
- **Tier 3 — Threat Hunting**: Proactive search for IOCs, TTP analysis, malware reverse engineering

---

## Detection Tools

- **SIEM**: Splunk (SPL queries, correlation rules), Elastic Security (EQL, detection rules), Microsoft Sentinel (KQL, UEBA analytics), Chronicle (YARA-L, telemetry graph)
- **IDS/IPS**: Snort (signature-based, rule sets), Suricata (multi-threaded, file extraction), Zeek (protocol analysis, metadata logging)
- **EDR**: CrowdStrike Falcon (cloud-native, IOA engine), SentinelOne (autonomous, rollback), Microsoft Defender for Endpoint (device timeline, ASR rules), Palo Alto Cortex XDR (cross-data-layer correlation)

## Forensics

- **Memory dump**: `LiME` (Linux), `WinPmem` (Windows), `Magnet RAM Capturer`
- **Disk imaging**: `dd`, `Guymager`, `FTK Imager` — always use write-blocker, SHA-256 hash
- **Timeline analysis**: `Plaso/log2timeline`, `sleuthkit`, `Autopsy`
- **Chain of custody**: Document each evidence handoff (who, when, where, purpose)
- **Key artifacts**: Prefetch/SRUM (process execution), $MFT/USN journal (file activity), Event Logs (4624/4625 logon, 4688 process creation), Registry (autoruns, MRU)

---

## Common Incident Types & Playbook Highlights

- **Ransomware**: Isolate host → Disable SMB shares → Identify patient zero → Determine encryption scope → Assess backup integrity → Negotiate/restore decision
- **Data Breach**: Identify exfil vector → Scope compromised data → Engage forensics → Notify legal → Regulatory 72-hr notification (GDPR) → Customer notification
- **Account Takeover (ATO)**: Force password reset → Revoke sessions → Check MFA bypass → Review login patterns → Enable Impossible Travel rules → Check for persistence
- **DDoS**: Mitigation via scrubbing center (Cloudflare, Akamai, AWS Shield) → Rate limiting rules → Scale up resources → Traffic profiling rule deployment

## Communication Templates

- **Internal**: "Security incident detected involving [X]. Investigating. Next update @ [time]. If you see [Y], report to [Z]."
- **Customer**: "We have identified an incident affecting [scope]. [Action taken]. No action required at this time. Contact [email] for questions."
- **Regulatory**: "On [date/time], we detected [incident type]. Affected [records count] of [data types]. [Containment actions taken]. Root cause: [summary]. Remediation: [steps]."
- **Press**: "We are investigating a security incident. User trust and data protection are our top priority. We will provide updates as our investigation proceeds."

---

## Tabletop Exercises & Purple Teaming

- **Tabletop formats**: Facilitator-led, inject-based, "red/blue" team discussion, decision-timing drills
- **Purple teaming**: Blue team detection vs Red team TTPs → Gap analysis → Detection engineering improvements
- **Sample scenarios**: Ransomware deployment, insider threat, supply chain compromise, cloud credential theft
- **Cadence**: Full-scale tabletop quarterly, purple team engagements twice/year, individual playbook walkthroughs monthly

## Post-Incident Reporting & Root Cause Analysis

- **Report structure**: Executive summary → Timeline of events → Scope & impact → Root cause → Controls that failed → Remediation plan → Lessons learned
- **RCA techniques**: 5 Whys, fishbone diagram, fault tree analysis, swiss cheese model
- **Data retention**: Keep all incident artifacts minimum 1 year (or regulatory requirement)
- **Metrics tracking**: MTTD (detection), MTTC (containment), MTTR (recovery), time to notification
