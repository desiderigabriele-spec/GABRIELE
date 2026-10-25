# Collegare desidericode.it e desidericode.com (Register.it → Vercel)

Indirizzo principale: **desidericode.it**. Gli altri tre portano lì.

## 1. Su Vercel
Progetto **desiderigabriele** → Settings → Domains → Add:

| Dominio | Come impostarlo |
|---|---|
| desidericode.it | principale (Production) |
| www.desidericode.it | Redirect to desidericode.it (308) |
| desidericode.com | Redirect to desidericode.it (308) |
| www.desidericode.com | Redirect to desidericode.it (308) |

Per ogni dominio Vercel mostra i record DNS da mettere: copia quelli che vedi (di solito sono questi).

| Tipo | Nome | Valore |
|---|---|---|
| A | @ (vuoto) | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## 2. Su Register.it (per ognuno dei due domini)
Area clienti → il dominio → **DNS e Name Server** → **Gestione DNS** (o «Configurazione DNS avanzata»):
1. Cancella i record **A** e **CNAME** che ci sono già per `@` e `www` (puntano alla pagina di parcheggio di Register).
2. Aggiungi il record **A** e il record **CNAME** della tabella sopra.
3. **Non toccare** i record MX e TXT: servono per l'email.
4. Salva.

## 3. Aspetta
Di solito bastano da 10 minuti a qualche ora (al massimo 24-48). Su Vercel, accanto a ogni dominio, la scritta diventa «Valid Configuration» e il lucchetto (https) si attiva da solo.

## Dopo
- Email col dominio (es. ciao@desidericode.it): si attiva da Register.it (caselle email) o con Google Workspace. Va aggiunta in `src/data/sito.js` al posto della Gmail.
- Google Search Console: aggiungi la proprietà desidericode.it e invia la mappa `https://desidericode.it/sitemap-index.xml`.
