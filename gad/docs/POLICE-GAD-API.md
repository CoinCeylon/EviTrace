Status: The team agreed on the workflow. GAD first confirms that the

transfer reached its inbox. After the officer makes a decision, GAD sends

Police a signed acceptance or rejection. The exact field names, signing

format, and API addresses are still open.



\## 6. Example GAD replies — proposed field names



Both replies refer to the same handover, TR-001, and the same USB, EV-001.



\### When the transfer reaches the GAD inbox



```json

{

&#x20; "transferId": "TR-001",

&#x20; "evidenceId": "EV-001",

&#x20; "status": "AWAITING\_ACCEPTANCE"

}

```



\### When the officer accepts the USB



```json

{

&#x20; "transferId": "TR-001",

&#x20; "evidenceId": "EV-001",

&#x20; "decision": "ACCEPTED",

&#x20; "decidedAt": "2026-11-24T10:15:00+05:30",

&#x20; "officerRef": "GAD-OFFICER-01"

}

```



The second example shows the proposed receipt details. Police B verifies

GAD's signature before displaying “Accepted by GAD”. The teams still

need to agree on the exact fields and signature format.

