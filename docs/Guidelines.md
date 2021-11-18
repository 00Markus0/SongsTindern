# Guidelines zur Nutzung dieses Repositorys

## Allgemeine Hinweise und Vorgaben

- Das Repository besteht im initialen Stand aus der `master`- und einer `dev`-Branch. Arbeiten Sie ausschließlich im `dev`-Branch und überführen Sie **funktionierende** Änderungen über *Pull Requests* in den `master`-Branch.

- Erweitern Sie bei Bedarf die vorgeschlagenen *Branches* um z.B. *Feature*-Branches. Behalten Sie die grundlegende Trennung zwischen *Master* und *Dev* aber stets bei: **Im Master-Branch befinde sich immer die aktuell funktionierende, fehlerfreie und installierbare Version Ihrer Anwendung**.

- Gehen Sie sorgfältig bei der Erstellung von *Issues* und *Commit Messages* vor: Die Qualität dieser Artefakte fließt in die Bewertung ein.

- Kommunizieren Sie (technische) Probleme über *Issues*, zu denen Sie mich (Github-Nutzer `alexanderbazo`) hinzufügen.

- Halten Sie die Readme-Datei(en) stets aktuell und entfernen Sie die Platzhaltertexte.

## Zusätzliche Übereinkünfte

[omment]: # ([Notieren Sie hier alle team-internen Übereinkünfte zur Verwendung des Repositorys, z.B. spezielle Überlegungen zur Codequalität oder zur Formulierung von *Commit Messages*])
- Commit Messages werden sinnvoll gefüllt und auf englisch oder deutsch formuliert.
- Kommentare werden auf deutsch formuliert.
- Variablen- und Methodennamen werden auf Englisch formuliert.
- Bei Problemen besprechen wir uns innerhalb einer Woche im Discord.
- Bei größeren Problemen erstellen wir Issues und teilen diese dem verantwortlichen Teampartner zu.
- Für jede Funktion erstellen wir einen eigenen Branch. Nachdem die Funtkionalität implementiert wurde, erstellen wir pull requests.
- Bevor ein Pull Request gemerged wird, führen mind. 2 Projektteilnehmer Tests durch.
- Wir besprechen uns wöchentlich.
- Wir halten uns an die allgemein gültigen Konventionen.
- Events werden über das Observer-Pattern statt über Callbacks kommuniziert.
