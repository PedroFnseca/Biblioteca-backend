import emailTemplate from "./template.js";

export default function(
  user_name,
  recovery_token
){
  const title = "Recuperação de senha";

  const message = `
    <p>O código para a recuperação de senha é:</p>
    <p id="code-pwd">${recovery_token}</p>
  `

  try{
    return emailTemplate(title, user_name, message);
  } catch(err){
    console.log(err.message);
  }
}