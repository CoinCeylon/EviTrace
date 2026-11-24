\# GAD evidence reception



\## 1. Purpose



This workflow records the handover of evidence from Police B to GAD.

A transfer appears in the GAD inbox when the submission arrives.

GAD records custody once an authorized officer accepts the item and

the system saves a signed receipt.



\## 2. Receive the transfer



Police B submits a transfer with a Transfer ID and an Evidence ID.

The Transfer ID identifies this particular handover. The Evidence ID

identifies the item throughout its history.



GAD saves the submission and displays it in \*\*Incoming Transfers\*\*

with the status \*\*Awaiting acceptance\*\*. Opening the submission lets

the officer review it. Custody stays unchanged during review.



\## 3. Verify the submission and inspect the item



The backend checks the digital records. The receiving officer inspects

the physical item. The reception screen displays both sets of results.



| Check | Performed by | What is checked or recorded |

|---|---|---|

| Sender signature | GAD backend | The signature matches the transfer details and Police B's registered signing key. |

| Cardano record | GAD backend | Police B's transaction is confirmed and contains the expected value for this transfer. |

| Attached files | GAD backend | Each received file has the same fingerprint as the file Police B registered. |

| Custody history | GAD backend | The transfer follows the previous event for the same evidence item. |

| Physical inspection | Receiving officer | The officer records the package condition, seal number, and any damage or discrepancy. |



\## 4. Decide whether to accept



| Situation | What happens |

|---|---|

| A required check is pending or cannot be completed | Acceptance stays blocked. The screen explains what is outstanding. |

| A required check fails | Acceptance stays blocked. The screen identifies the failed check. The officer can reject the transfer and record a reason. |

| All required checks pass and the inspection is recorded | An authorized officer can review the results and choose whether to accept. |



When the officer accepts, GAD saves the signed receipt, the custody

event, and the accepted status together. If saving fails, the transfer

remains awaiting acceptance. After a successful save, GAD queues the

acknowledgement for Police B and tracks the Cardano confirmation of

GAD's receipt separately.



\## 5. Test the workflow



Use fictional USB drive `EV-001` and transfer `TR-001`.



| Scenario | Expected result |

|---|---|

| Police B submits the transfer at 10:00. The officer opens the inbox at 10:05. | `EV-001` appears as \*\*Awaiting acceptance\*\*. GAD's list of evidence in custody does not yet include it. |

| At 10:15, all checks have passed. The officer records an intact seal and accepts. | GAD lists `EV-001` as held in custody. The signed receipt identifies `TR-001`, the receiving officer, the acceptance time, and the observed condition. |

| In a separate test, the seal is intact but an attachment has a different fingerprint. | The screen identifies the file mismatch and blocks acceptance. The officer's seal observation remains visible. |

| Police B retries the same submission after losing the network response. | The inbox contains one entry for `TR-001`. If the same ID arrives with different transfer details, GAD flags a conflict and preserves the original record. |

