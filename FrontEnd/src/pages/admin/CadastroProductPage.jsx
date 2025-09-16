import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, PackagePlus, UploadCloud } from 'lucide-react';
import './css/CadastroProductPage.css';

const productSchema = yup.object().shape({
    nome: yup.string().required('O nome do produto é obrigatório'),
    preco: yup.number().typeError('O preço deve ser um número').positive('O preço deve ser positivo').required('O preço é obrigatório'),
    estoque: yup.number().typeError('O estoque deve ser um número').integer('O estoque deve ser um número inteiro').min(0, 'O estoque não pode ser negativo').required('O estoque é obrigatório'),
    descricao: yup.string().required('A descrição é obrigatória'),
    avaliacao: yup.number().typeError('A avaliação deve ser um número').min(0, 'Mínimo 0').max(5, 'Máximo 5').nullable().transform((value, originalValue) => originalValue.trim() === "" ? null : value),
});

function CadastroProductPage() {
    const navigate = useNavigate();
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(productSchema)
    });

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setMensagemApi("");
        setIsError(false);

        if (!imageFile) {
            setMensagemApi("Por favor, selecione uma imagem para o produto.");
            setIsError(true);
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('file', imageFile);

            // 1. Envia a imagem para o seu backend local
            const uploadResponse = await fetch("http://localhost:8080/auth/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Falha no upload da imagem.");

            const uploadResult = await uploadResponse.json();
            const imageUrl = uploadResult.url;

            // 2. Prepara os dados do produto com a URL retornada pelo backend
            const productData = {
                ...data,
                imagens: [{
                    caminhoImagem: imageUrl,
                    principal: true
                }]
            };
            
            // 3. Cadastra o produto
            const productResponse = await fetch("http://localhost:8080/auth/produto/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(productData),
            });

            if (productResponse.ok) {
                setMensagemApi("Produto cadastrado com sucesso!");
                setIsError(false);
                reset();
                setImagePreview(null);
                setImageFile(null);
                setTimeout(() => navigate('/AdminDashboardPage'), 2000);
            } else {
                throw new Error("Ocorreu um erro ao cadastrar o produto.");
            }
        } catch (error) {
            setMensagemApi(error.message || "Não foi possível conectar ao servidor.");
            setIsError(true);
        }
    };

    return (
        <div className="product-page-bg">
            <div className="product-container">
                {/* O seu formulário JSX permanece o mesmo */}
                <h1 className="product-title">
                    <PackagePlus size={32} className="primary-color" />
                    Cadastrar Novo Produto
                </h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="nome" className="form-label">Nome do Produto</label>
                            <input type="text" id="nome" {...register("nome")} placeholder="Caneca Developer Edition" className="form-input" />
                            {errors.nome && <p className="form-error">{errors.nome.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="preco" className="form-label">Preço (R$)</label>
                            <input type="number" id="preco" {...register("preco")} placeholder="49.90" step="0.01" className="form-input" />
                            {errors.preco && <p className="form-error">{errors.preco.message}</p>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="estoque" className="form-label">Quantidade em Estoque</label>
                            <input type="number" id="estoque" {...register("estoque")} placeholder="100" className="form-input" />
                            {errors.estoque && <p className="form-error">{errors.estoque.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="descricao" className="form-label">Descrição Detalhada</label>
                            <textarea id="descricao" {...register("descricao")} placeholder="Descreva os materiais, dimensões e características da caneca." className="form-textarea"></textarea>
                            {errors.descricao && <p className="form-error">{errors.descricao.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="avaliacao" className="form-label">Avaliação (Opcional)</label>
                            <input type="number" id="avaliacao" {...register("avaliacao")} placeholder="Ex: 4.5" step="0.1" min="0" max="5" className="form-input" />
                            {errors.avaliacao && <p className="form-error">{errors.avaliacao.message}</p>}
                        </div>
                    </div>
                    
                    <div className="image-upload-section">
                        <label className="form-label">Imagem Principal do Produto</label>
                        <div className="image-preview" onClick={() => document.getElementById('imageInput').click()}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Pré-visualização do Produto" />
                            ) : (
                                <div className="image-placeholder">
                                    <UploadCloud size={48} className="image-placeholder-icon" />
                                    <span>Clique para adicionar uma imagem</span>
                                </div>
                            )}
                        </div>
                        <input type="file" id="imageInput" className="file-input" accept="image/*" onChange={handleImageChange} />
                    </div>

                     {mensagemApi && (
                        <p className={`api-message ${isError ? 'error' : 'success'}`}>{mensagemApi}</p>
                    )}
                    
                    <div className="buttons-section">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} />
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Cadastrar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastroProductPage;