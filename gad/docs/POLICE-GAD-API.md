Status: The team agreed on the workflow. GAD first confirms that the

transfer reached its inbox. After the officer makes a decision, GAD sends

Police a signed acceptance or rejection. The exact field names, signing

format, and API addresses are still open.



## 6. Example GAD replies — proposed field names



These examples use handover TR-001 and evidence item EV-001. Acceptance and rejection are alternative outcomes.



### When the transfer reaches the GAD inbox



```json

{

  "transferId": "TR-001",

  "evidenceId": "EV-001",

  "status": "AWAITING_ACCEPTANCE"

}

```



### When the officer accepts the USB



```json

{

  "transferId": "TR-001",

  "evidenceId": "EV-001",

  "decision": "ACCEPTED",

  "decidedAt": "2026-11-24T10:15:00+05:30",

  "officerRef": "GAD-OFFICER-01"

}

```



The second example shows the proposed receipt details. Police B verifies

GAD's signature before displaying “Accepted by GAD”. The teams still

need to agree on the exact fields and signature format.

### When the officer rejects the USB

```json
{
  "transferId": "TR-001",
  "evidenceId": "EV-001",
  "decision": "REJECTED",
  "decidedAt": "2026-11-24T10:15:00+05:30",
  "officerRef": "GAD-OFFICER-01"
}
```

Police B verifies GAD's signature before displaying “Rejected by GAD”.
