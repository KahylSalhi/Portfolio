const input=document.getElementById("mdp");
const resultat=document.getElementById("resultat");
input.addEventListener("input",function(){
    const mdp=input.value;

    if(mdp.length===0){
        resultat.style.display="none";
        return;
    }
    analyser(mdp);
});

function analyser(mdp){
    const criteres={
        longueur:mdp.length>=12,
        majuscule:/[A-Z]/.test(mdp),
        minuscule:/[a-z]/.test(mdp),
        chiffre:/\d/.test(mdp),
        caractereSpecial:/[^a-zA-Z0-9]/.test(mdp)
    }

const score=Object.values(criteres).filter(Boolean).length;

afficher(criteres,score);

    
}

function afficher(criteres, score) {

  const niveaux = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  const couleurs = ["#e74c3c", "#e67e22", "#f1c40f", "#7a9e3a", "#5a7a3a"];

  const niveau = niveaux[score - 1] || "Très faible";
  const couleur = couleurs[score - 1] || "#e74c3c";

  resultat.style.display = "block";
  resultat.style.borderLeftColor = couleur;

  resultat.innerHTML = `
    <div style="margin-bottom: 14px;">
      <span style="font-size: 13px; color: #6b6860;">Force : </span>
      <span style="font-size: 14px; font-weight: bold; color: ${couleur};">${niveau} (${score}/5)</span>
    </div>

    <div style="font-size: 13px; color: #6b6860; margin-bottom: 8px;">Critères :</div>

    <div>${critere(criteres.longueur,  "Au moins 12 caractères")}</div>
    <div>${critere(criteres.majuscule, "Une lettre majuscule")}</div>
    <div>${critere(criteres.minuscule, "Une lettre minuscule")}</div>
    <div>${critere(criteres.chiffre,   "Un chiffre")}</div>
    <div>${critere(criteres.caractereSpecial,   "Un caractère spécial (!@#$...)")}</div>
  `;
}

function critere(valide, texte) {
  const symbole = valide ? "✓" : "✗";
  const couleur  = valide ? "#5a7a3a" : "#e74c3c";
  return `<div style="color: ${couleur}; margin: 5px 0;">${symbole} ${texte}</div>`;
}
