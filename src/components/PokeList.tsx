import { useState, useEffect } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import EvolutionPopup from './EvolutionPopup';

export interface Pokemon {
    name: string;
    url: string;
    imageUrl?: string;
    types: string[];
}

const ITEMS_PER_PAGE = 10;

const PokeList = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchPokemons = async () => {
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100');
            setPokemons(response.data.results);
        };

        fetchPokemons();
    }, []);

    useEffect(() => {
        const filteredPokemons = pokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setTotalPages(Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    }, [searchTerm, pokemons]);

    const handleViewEvolutions = async (pokemon: Pokemon) => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
            const pokemonDetails = {
                ...pokemon,
                imageUrl: response.data.sprites.front_default || 'default-image-url.png',
                types: response.data.types.map((typeItem: any) => typeItem.type.name) || []
            };

            setSelectedPokemon(pokemonDetails);
            setShowEvolutionPopup(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du Pokémon:", error);
        }
    };

    const handleClosePopup = () => {
        setShowEvolutionPopup(false);
        setSelectedPokemon(null);
    };

    const goToNextPage = () => {
        setCurrentPage(currentPage => Math.min(currentPage + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage(currentPage => Math.max(currentPage - 1, 1));
    };

    const currentPokemons = pokemons
        .filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div>
            <div className="search-bar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="Rechercher un Pokémon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {currentPokemons.map(pokemon => (
                <div className="lignes" key={pokemon.name}>
                    <PokeCard pokemon={pokemon} />
                    <button onClick={() => handleViewEvolutions(pokemon)}>Voir Évolutions</button>
                </div>
            ))}
            <div className="pagination">
                <button onClick={goToPreviousPage} disabled={currentPage === 1}>Précédent</button>
                <span>Page {currentPage} sur {totalPages}</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages}>Suivant</button>
            </div>
            {showEvolutionPopup && selectedPokemon && (
                <EvolutionPopup
                    pokemonId={selectedPokemon.url}
                    pokemonDetails={{
                        ...selectedPokemon,
                        imageUrl: selectedPokemon.imageUrl || 'default-image-url.png'
                    }}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default PokeList;