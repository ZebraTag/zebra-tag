# zebra-tag READ-ME


ZEBRA TAG - V0.1.4
Documentation and User Guide

Zebra Tag is a web-based scoring engine for laser-tag style games using barcode technology and Firebase Realtime Database.
1. Requirements
Hardware

    Scanner: A barcode scanner that supports HID keyboard emulation (acts as a keyboard).

    Tags: OPU stickers or printed barcodes.

2. Setup and Registration
Account Creation

Users must register for a free account to participate in the global ranking.
   
3. Game Mechanics
Scoring

    Authentication: Sign in to your account.

    Scanner Mode: The application automatically focuses on a hidden input field to capture scanner data.

    Valid Scans: When a barcode starting with "SHP" is detected, the user's score increases by one.

    Cooldown: A 1-second cooldown period follows every successful scan to prevent rapid-fire point accumulation. The score display will dim during this period.

    Manual Entry: If hardware fails, tapping the primary score counter will trigger a manual point.

Leaderboard

The leaderboard provides a live ranking of all registered users.

4. Administration
Admin Privileges

Users verified in the ADMIN_LIST have access to the following:

5. Legal Disclaimer

USE AT YOUR OWN RISK. The developer of Zebra Tag is not responsible or liable for any injury, property damage, or disciplinary action resulting from the use of this software. Users are expected to follow local laws and safety guidelines during physical gameplay.
