// ==============================
// CONFIGURAÇÃO DO SUPABASE
// ==============================
const SUPABASE_URL = "https://kpfozkylzkvwxgbteesk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZm96a3lsemt2d3hnYnRlZXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODg0NDMsImV4cCI6MjA4MDI2NDQ0M30.e2qUbOSXlHYEIFtEopyQRcOTR4UoYL8CbtsMG3nlR1A";

const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================
// ELEMENTOS DO FORM
// ==============================
const form = document.getElementById('formulario');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const nome = document.getElementById('nome');

const isCadastro = document.body.classList.contains("cadastro");
const isLogin = document.body.classList.contains("login");


// ==============================
// EVENTO DO FORM
// ==============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isCadastro) validateInputsCadastro();
    if (isLogin) validateInputsLogin();

    const hasErrors = form.querySelectorAll(".input-control.error").length > 0;
    if (hasErrors) return;

    if (isCadastro) await cadastrarSupabase();
    if (isLogin) await loginSupabase();
});


// ==============================
// FUNÇÃO: CADASTRO COMPLETO
// ==============================
async function cadastrarSupabase() {
    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();
    const nomeValue = nome.value.trim();

    // 1 — Criar usuário no Auth
    const { data: authData, error: authError } = await supa.auth.signUp({
        email: emailValue,
        password: senhaValue
    });

    if (authError) {
        alert("Erro ao criar usuário: " + authError.message);
        return;
    }

    // 2 — Inserir dados adicionais na tabela “usuarios”
    const { error: insertError } = await supa
        .from("usuarios")
        .insert([
            {
                id: authData.user.id,
                nome: nomeValue,
                email: emailValue,
                senha: senhaValue
            }
        ]);

    if (insertError) {
        alert("Erro ao salvar dados: " + insertError.message);
        return;
    }

    alert("Conta criada com sucesso!");
    window.location.href = "login.html";
}


// ----------------- FUNÇÃO: LOGIN -----------------
async function loginSupabase() {
    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();

    // 1. Buscar o usuário pelo e-mail
    const { data, error } = await supa
        .from("usuarios")
        .select("*")
        .eq("email", emailValue)
        .maybeSingle(); // evita erro quando não encontra

    // Caso o SELECT falhe
    if (error) {
        alert("Erro ao buscar usuário: " + error.message);
        return;
    }

    // Caso o usuário não exista
    if (!data) {
        alert("Email não encontrado!");
        return;
    }

    // 2. Comparar a senha digitada com a armazenada
    if (data.senha !== senhaValue) {
        alert("Senha incorreta!");
        return;
    }

    // 3. Login correto
    alert("Login realizado com sucesso!");
    window.location.href = "sobre.html";
}




// ==============================
// FUNÇÕES DE ERRO E SUCESSO
// ==============================
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector(".error");
    errorDisplay.innerText = message;
    inputControl.classList.add("error");
    inputControl.classList.remove("success");
};

const setSuccess = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector(".error");
    errorDisplay.innerText = "";
    inputControl.classList.add("success");
    inputControl.classList.remove("error");
};


// ==============================
// VALIDADORES DE FORM
// ==============================
const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const isValidNome = (nome) =>
    /^[A-Za-zÀ-ÿ]+\s+[A-Za-zÀ-ÿ\s]+$/.test(String(nome).trim());


// ----------- Validação do Cadastro ------------
const validateInputsCadastro = () => {
    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();
    const nomeValue = nome.value.trim();

    if (emailValue === "") setError(email, "O email está vazio");
    else if (!isValidEmail(emailValue)) setError(email, "Email inválido");
    else setSuccess(email);

    if (senhaValue === "") setError(senha, "A senha está vazia");
    else if (senhaValue.length > 8) setError(senha, "Máx. 8 caracteres");
    else setSuccess(senha);

    if (nomeValue === "") setError(nome, "O nome está vazio");
    else if (!isValidNome(nomeValue)) setError(nome, "Digite o nome completo");
    else setSuccess(nome);
};

// ----------- Validação do Login ------------
const validateInputsLogin = () => {
    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();

    if (emailValue === "") setError(email, "O email está vazio");
    else if (!isValidEmail(emailValue)) setError(email, "Email inválido");
    else setSuccess(email);

    if (senhaValue === "") setError(senha, "A senha está vazia");
    else if (senhaValue.length > 8) setError(senha, "Máx. 8 caracteres");
    else setSuccess(senha);
};
