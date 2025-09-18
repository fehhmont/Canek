import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, PackagePlus, UploadCloud, X, Star } from 'lucide-react';
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
    
    // Novo estado para a lista de imagens
    const [images, setImages] = useState([]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(productSchema)
    });

    // Função para lidar com a seleção de novas imagens
    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const newImages = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            isPrincipal: false
        }));

        // Se for a primeira imagem, define como principal
        if (images.length === 0 && newImages.length > 0) {
            newImages[0].isPrincipal = true;
        }

        setImages(prevImages => [...prevImages, ...newImages]);
    };

    // Função para definir uma imagem como principal
    const setAsPrincipal = (index) => {
        setImages(images.map((img, i) => ({
            ...img,
            isPrincipal: i === index
        })));
    };

    // Função para remover uma imagem da lista
    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        // Se a imagem removida era a principal, define a primeira da lista como nova principal
        if (images[index].isPrincipal && newImages.length > 0) {
            newImages[0].isPrincipal = true;
        }
        setImages(newImages);
    };

    const onSubmit = async (data) => {
        setMensagemApi("");
        setIsError(false);

        if (images.length === 0) {
            setMensagemApi("Por favor, adicione pelo menos uma imagem para o produto.");
            setIsError(true);
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            
            // 1. Faz o upload de todas as imagens em paralelo
            const uploadPromises = images.map(image => {
                const formData = new FormData();
                formData.append('file', image.file);
                return fetch("http://localhost:8080/auth/upload", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData,
                }).then(res => res.ok ? res.json() : Promise.reject(new Error("Falha no upload")));
            });

            const uploadResults = await Promise.all(uploadPromises);

            // 2. Prepara os dados do produto com os caminhos das imagens
            const productData = {
                ...data,
                imagens: uploadResults.map((result, index) => ({
                    caminhoImagem: new URL(result.url).pathname,
                    principal: images[index].isPrincipal
                }))
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
                setImages([]);
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
                <h1 className="product-title">
                    <PackagePlus size={32} className="primary-color" />
                    Cadastrar Novo Produto
                </h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                    <div className="form-section">
                        {/* Seus campos de formulário continuam aqui... */}
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
                        <label className="form-label">Imagens do Produto</label>
                        {/* Botão de Adicionar Imagem */}
                        <div className="image-preview" onClick={() => document.getElementById('imageInput').click()}>
                            <div className="image-placeholder">
                                <UploadCloud size={48} className="image-placeholder-icon" />
                                <span>Clique para adicionar imagens</span>
                            </div>
                        </div>
                        <input type="file" id="imageInput" className="file-input" accept="image/*" multiple="true" onChange={handleImageChange} />
                        
                        {/* Lista de Imagens Adicionadas */}
                        <div className="image-list">
                            {images.map((image, index) => (
                                <div key={index} className="image-list-item">
                                    <img src={image.preview} alt={`Preview ${index + 1}`} />
                                    <div className="image-actions">
                                        <button 
                                            type="button" 
                                            onClick={() => setAsPrincipal(index)}
                                            disabled={image.isPrincipal}
                                            title="Definir como principal"
                                            className="action-btn-principal"
                                        >
                                            <Star size={16} fill={image.isPrincipal ? '#ffc107' : 'none'} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(index)}
                                            title="Remover imagem"
                                            className="action-btn-remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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