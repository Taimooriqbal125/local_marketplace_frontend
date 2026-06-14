✅ isActive = false kab karna hai?

Sirf in 3 situations me:

1. ❌ Push send karte waqt error aaye

Agar response me aaye:

DeviceNotRegistered
InvalidToken
NotRegistered

👉 Immediately:

isActive = false
2. 📱 User logout kare (optional but recommended)

Agar tum per-user tokens manage kar rahe ho:

👉 Logout par:

isActive = false
3. ⏳ Bohat zyada time se use nahi hua

Cron job me:

30–90 din se use nahi hua

👉 ya to delete karo ya:

isActive = false