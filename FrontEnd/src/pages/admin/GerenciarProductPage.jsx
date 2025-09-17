import React from "react";

function GerenciarProductPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Produtos</h1>
      
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        + Adicionar Produto
      </button>

      <table className="w-full mt-6 border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Preço</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border">1</td>
            <td className="p-2 border">Produto Teste</td>
            <td className="p-2 border">R$ 100,00</td>
            <td className="p-2 border">
              <button className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
                Editar
              </button>
              <button className="bg-red-500 text-white px-3 py-1 rounded">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default GerenciarProductPage;
