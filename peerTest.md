Joshua Swartz and Anton Anderson

## Self Attack:
### Joshua Swartz:
### Anton Anderson:
| |  Attack Report |
| ------------- | - |
| Date: | 12/4/2025 |
| Website: | pizza.antonanderson.click |
| Classification: | Cryptographic Failures |
| Severity: | High or Medium (2 or 3) |
| Description: | Passwords were not hashed. Burp suite was having some issues so the attack was not as effective as it potentially could have been. It caused a Grafana alert due to increased latency |
| Corrections: | None have been made yet. Maybe try to RSA encrypt the body so the password is not sent in plain text. |

## Peer Attack:
### Joshua Swartz on Anton's Website:
| | Attack Report |
| - | ----------- |
| Date: | 12/5/2025 |
| Website: | pizza.antonanderson.click |
| Classification: | Cryptographic Failure |
| Severity: | Low |
| Description: | Identified user id sent back to frontend. Exposes some database structure. Used my own user id as part of an attempted SQL injection attack |
| Corrections: | |

| | Attack Report |
| - | ----------- |
| Date: | 12/5/2025 |
| Website: | pizza.antonanderson.click |
| Classification: | Identification and Authentication Failures |
| Severity: | High |
| Description: | Admin had a weak password that was easy to brute force through Intruder |
| Corrections: | Change Admin Password |

### Anton Anderson on Josh's Website:
| | Attack Report |
| - | ------------- |
| Date: | 12/5/2025 |
| Website: | pizza.jswartz.click |
| Classification: | Identification and Authentication Failures |
| Severity: | High |
| Description: | Admin had a weak password and email that was easy to brute force through Intruder |
| Corrections: | Change Admin Password |

## Findings:
We both tried to get a SQL Injection working on each others websites, but we discovered it was significantly harder that it first seemed. Luckily the mySQL seems to block the use of 'side-effect'
statements and the SQL library we use also seems to block the execution of multiple statements. We were able to cause sql exceptions but no other long lasting results. 

We also both learned that it is easy to forget to change a temporary password, like an admin password. 
Penetration testing is not easy and you can sometimes spend signficant time trying something that does not end up being fruitful.
But it is crucial as uncaught vulnerabilties could cause significant damage to the website, company, users, or revenue.
It is something we will need to further out skill in the future
