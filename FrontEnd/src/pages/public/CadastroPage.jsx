import React from "react";
import { Link } from "react-router-dom";


function CadastroPage() {

    return (
        <div>
            <h1>Pagina de Cadastro</h1>
            <form>
                <label htmlFor="nome">Nome:</label>
                <input type="text" id="nome" name="nome"/>
                <br/>
                <button type="submmit">Cadastrar</button>

            </form>
            <br/>
            <Link to="/">Voltar para pagina principal</Link>
        </div>
    )

}

export default CadastroPage;