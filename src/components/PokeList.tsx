import { useState, useEffect } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import EvolutionPopup from './EvolutionPopup';

export interface Pokemon {
    evolutionChainId: any;
    name: string;
    url: string;
    imageUrl?: string;
    types: string[];
    stats?: { [key: string]: number };
}

const ITEMS_PER_PAGE = 9;

const PokeList = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [, setIsLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    const pokemonTypes = ['feu', 'eau', 'plante', 'vol', 'insecte', 'poison', 'normal', 'électrik', 'sol', 'fée', 'combat', 'psy', 'roche', 'acier', 'glace', 'spectre'];

    const pokemonTypeMapping: { [key: string]: string } = {
        'feu': 'fire',
        'eau': 'water',
        'plante': 'grass',
        'vol': 'flying',
        'insecte': 'bug',
        'poison': 'poison',
        'normal': 'normal',
        'électrik': 'electric',
        'sol': 'ground',
        'fée': 'fairy',
        'combat': 'fighting',
        'psy': 'psychic',
        'roche': 'rock',
        'acier': 'steel',
        'glace': 'ice',
        'spectre': 'ghost'
    };

    const [allDataLoaded, setAllDataLoaded] = useState(false);

    useEffect(() => {
        const fetchPokemons = async () => {
            setIsLoading(true);
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100');
            const pokemonsWithImages = await Promise.all(response.data.results.map(async (pokemon: Pokemon) => {
                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                const types = pokemonResponse.data.types.map((type: any) => type.type.name);
                return {
                    ...pokemon,
                    imageUrl: pokemonResponse.data.sprites.front_default,
                    types: types
                };
            }));
            setPokemons(pokemonsWithImages);
            setIsLoading(false);
            setAllDataLoaded(true);
        };

        if (!allDataLoaded) {
            fetchPokemons();
        }
    }, [allDataLoaded]);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter]);

    const filteredPokemons = typeFilter ? pokemons.filter(pokemon => pokemon.types.includes(pokemonTypeMapping[typeFilter])) : pokemons;

    const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE);

    const currentPokemons = filteredPokemons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleViewEvolutions = async (pokemon: Pokemon) => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
            const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
            const evolutionChainId = evolutionChainUrl.split('/')[6];

            const types = await Promise.all(response.data.types.map(async (type: any) => {
                const typeResponse = await axios.get(type.type.url);
                const frenchTypeObj = typeResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                return frenchTypeObj ? frenchTypeObj.name : type.type.name;
            }));

            const stats = response.data.stats.reduce((acc: { [x: string]: any; }, stat: { stat: { name: any; }; base_stat: any; }) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const pokemonDetails = {
                ...pokemon,
                imageUrl: response.data.sprites.front_default || 'default-image-url.png',
                types: types || [],
                evolutionChainId: evolutionChainId,
                stats: stats
            };

            setSelectedPokemon(pokemonDetails);
            setShowEvolutionPopup(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du Pokémon:", error);
        }
        document.body.style.overflow = 'hidden';
    };

    const handleClosePopup = () => {
        setShowEvolutionPopup(false);
        setSelectedPokemon(null);
        document.body.style.overflow = 'auto';
    };

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
            <div className="filter-bar">
                <select onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">Tous les types</option>
                    {pokemonTypes.map(type => (
                        <option value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <div className="pokemonList">
                {currentPokemons.map(pokemon => (
                    <div className="pokemonName" key={pokemon.name}>
                        <PokeCard pokemon={pokemon} />
                        <button onClick={() => handleViewEvolutions(pokemon)}>Voir Évolutions</button>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button onClick={goToPreviousPage} hidden={currentPage === 1}>Précédent</button>
                <span className='nombrePage'>Page {currentPage} sur {totalPages}</span>
                <button onClick={goToNextPage} hidden={currentPage === totalPages}>Suivant</button>
            </div>
            {showEvolutionPopup && selectedPokemon && (
                <EvolutionPopup
                    pokemonId={selectedPokemon.url}
                    pokemonDetails={selectedPokemon}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default PokeList;