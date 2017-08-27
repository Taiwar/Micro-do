# Micro-do
A simple todo-webapp built using Firebase, JQuery and Materialize

## Running Micro-do
Micro-do uses Google Firebase's authentication and realtime databases.
You'll need to create your own firebase project and copy its configuration into `config.json`.
In the Firebase console you'll also have to enable email/password auth and set the database rules to 
```json
{
   "rules": {
     "lists": {
       "$uid": {
         ".read": "$uid === auth.uid",
         ".write": "$uid === auth.uid"
       }
     }
   }
 }
```