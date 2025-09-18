import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, PackagePlus, UploadCloud, X, Star } from 'lucide-react';
import './css/ProductFormPage.css'; // Lembre-se de renomear o CSS também
import { useAuth } from '../../components/AuthContext'; // Para verificar a permissão
import LoadingSpinner from '../../components/common/LoadingSpinner';

const productSchema = yup.object().shape({
    nome: yup.string().required('O nome do produto é obrigatório'),
    preco: yup.number().typeError('O preço deve ser um número').positive('O preço deve ser positivo').required('O preço é obrigatório'),
    estoque: yup.number().typeError('O estoque deve ser um número').integer('O estoque deve ser um número inteiro').min(0, 'O estoque não pode ser negativo').required('O estoque é obrigatório'),
    descricao: yup.string().required('A descrição é obrigatória'),
    avaliacao: yup.number().typeError('A avaliação deve ser um número').min(0, 'Mínimo 0').max(5, 'Máximo 5').nullable().transform((value, originalValue) => (originalValue.trim ? (originalValue.trim() === "" ? null : value) : value)),
});

function ProductFormPage() {
    const { productId } = useParams(); // Pega o ID da URL, se existir
    const isEditMode = !!productId; // Se tiver ID, está em modo de edição
    const navigate = useNavigate();
    const { user } = useAuth(); // Pega os dados do usuário logado

    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(productSchema)
    });

    // Se for modo de edição, busca os dados do produto
    useEffect(() => {
        if (isEditMode) {
            const fetchProductData = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`http://localhost:8080/auth/produto/listar`);
                    if (!response.ok) throw new Error('Falha ao buscar dados dos produtos.');

                    const products = await response.json();
                    const currentProduct = products.find(p => p.id.toString() === productId);

                    if (currentProduct) {
                        reset(currentProduct);
                        const loadedImages = currentProduct.imagens.map(img => ({
                            ...img,
                            preview: `http://localhost:8080${img.caminhoImagem}`,
                            isNew: false // Marca que a imagem já existe
                        }));
                        setImages(loadedImages);
                    } else {
                        throw new Error('Produto não encontrado.');
                    }
                } catch (error) {
                    setMensagemApi(error.message);
                    setIsError(true);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductData();
        }
    }, [productId, isEditMode, reset]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const newImages = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            isPrincipal: false,
            isNew: true // Marca que é uma nova imagem
        }));

        if (images.length === 0 && newImages.length > 0) {
            const hasPrincipal = images.some(img => img.isPrincipal);
            if (!hasPrincipal) newImages[0].isPrincipal = true;
        }
        setImages(prev => [...prev, ...newImages]);
    };

    const setAsPrincipal = (index) => {
        setImages(images.map((img, i) => ({ ...img, isPrincipal: i === index })));
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        if (images[index].isPrincipal && newImages.length > 0 && !newImages.some(img => img.isPrincipal)) {
            newImages[0].isPrincipal = true;
        }
        setImages(newImages);
    };

    const onSubmit = async (data) => {
        setMensagemApi("");
        setIsError(false);
        if (images.length === 0) {
            setMensagemApi("Adicione pelo menos uma imagem.");
            setIsError(true);
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            
            const newImagesToUpload = images.filter(img => img.isNew);
            const existingImages = images.filter(img => !img.isNew);

            const uploadPromises = newImagesToUpload.map(image => {
                const formData = new FormData();
                formData.append('file', image.file);
                return fetch("http://localhost:8080/auth/upload", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData,
                }).then(res => res.ok ? res.json() : Promise.reject(new Error("Falha no upload")));
            });

            const uploadResults = await Promise.all(uploadPromises);
            
            const uploadedImagePaths = uploadResults.map((result, index) => ({
                caminhoImagem: new URL(result.url).pathname,
                principal: newImagesToUpload[index].isPrincipal
            }));

            const finalImagePayload = [
                ...existingImages.map(img => ({ caminhoImagem: img.caminhoImagem, principal: img.isPrincipal })),
                ...uploadedImagePaths
            ];

            const productData = { ...data, imagens: finalImagePayload };
            
            const url = isEditMode
                ? `http://localhost:8080/auth/produto/atualizar/${productId}`
                : "http://localhost:8080/auth/produto/cadastrar";
            
            const method = isEditMode ? "PUT" : "POST";

            const productResponse = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(productData),
            });

            if (productResponse.ok) {
                setMensagemApi(`Produto ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
                setIsError(false);
                if (!isEditMode) {
                    reset();
                    setImages([]);
                }
                setTimeout(() => navigate('/GerenciarProductPage'), 2000);
            } else {
                throw new Error(`Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} o produto.`);
            }
        } catch (error) {
            setMensagemApi(error.message || "Não foi possível conectar ao servidor.");
            setIsError(true);
        }
    };

    const isStockerAndEdit = isEditMode && user.cargo === 'ESTOQUISTA';

    if (isLoading) return <LoadingSpinner message="Carregando produto..." />;

    return (
        <div className="product-page-bg">
            <div className="product-container">
                <h1 className="product-title">
                    <PackagePlus size={32} className="primary-color" />
                    {isEditMode ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="nome" className="form-label">Nome do Produto</label>
                            <input type="text" id="nome" {...register("nome")} disabled={isStockerAndEdit} className="form-input" />
                            {errors.nome && <p className="form-error">{errors.nome.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="preco" className="form-label">Preço (R$)</label>
                            <input type="number" id="preco" {...register("preco")} step="0.01" disabled={isStockerAndEdit} className="form-input" />
                            {errors.preco && <p className="form-error">{errors.preco.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="estoque" className="form-label">Quantidade em Estoque</label>
                            <input type="number" id="estoque" {...register("estoque")} className="form-input" />
                            {errors.estoque && <p className="form-error">{errors.estoque.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="descricao" className="form-label">Descrição Detalhada</label>
                            <textarea id="descricao" {...register("descricao")} disabled={isStockerAndEdit} className="form-textarea"></textarea>
                            {errors.descricao && <p className="form-error">{errors.descricao.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="avaliacao" className="form-label">Avaliação (Opcional)</label>
                            <input type="number" id="avaliacao" {...register("avaliacao")} step="0.1" min="0" max="5" disabled={isStockerAndEdit} className="form-input" />
                            {errors.avaliacao && <p className="form-error">{errors.avaliacao.message}</p>}
                        </div>
                    </div>
                    
                    <div className="image-upload-section">
                        <label className="form-label">Imagens</label>
                        <div className="image-preview" onClick={() => !isStockerAndEdit && document.getElementById('imageInput').click()} style={{ cursor: isStockerAndEdit ? 'not-allowed' : 'pointer' }}>
                            <div className="image-placeholder">
                                <UploadCloud size={48} className="image-placeholder-icon" />
                                <span>{isStockerAndEdit ? 'Edição de imagem desabilitada' : 'Clique para adicionar imagens'}</span>
                            </div>
                        </div>
                        <input type="file" id="imageInput" className="file-input" accept="image/*" multiple onChange={handleImageChange} disabled={isStockerAndEdit} />
                        
                        <div className="image-list">
                            {images.map((image, index) => (
                                <div key={index} className="image-list-item" data-principal={image.isPrincipal}>
                                    <img src={image.preview} alt={`Preview ${index + 1}`} />
                                    {!isStockerAndEdit && (
                                        <div className="image-actions">
                                            <button type="button" onClick={() => setAsPrincipal(index)} disabled={image.isPrincipal} title="Definir como principal" className="action-btn-principal">
                                                <Star size={16} fill={image.isPrincipal ? '#ffc107' : 'none'} />
                                            </button>
                                            <button type="button" onClick={() => removeImage(index)} title="Remover imagem" className="action-btn-remove">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                     {mensagemApi && (
                        <p className={`api-message ${isError ? 'error' : 'success'}`}>{mensagemApi}</p>
                    )}
                    
                    <div className="buttons-section">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/GerenciarProductPage')}>
                            <ArrowLeft size={16} />
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductFormPage;