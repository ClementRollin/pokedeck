import { useState, useEffect } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import EvolutionPopup from './EvolutionPopup';

export interface Pokemon {
    evolutionChainId: any;
    name: string;
    englishName?: string;
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
    const [isLoading, setIsLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string | null>(null);
    const [team, setTeam] = useState<string[]>([]);

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
                const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
                const frenchNameObj = speciesResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                const frenchName = frenchNameObj ? frenchNameObj.name : pokemon.name;
                const evolutionChainResponse = await axios.get(speciesResponse.data.evolution_chain.url);
                let evolutionStage = 1;
                let currentEvolution = evolutionChainResponse.data.chain;
                while (currentEvolution && currentEvolution.species.name !== pokemon.name) {
                    currentEvolution = currentEvolution.evolves_to[0];
                    evolutionStage++;
                }
                return {
                    ...pokemon,
                    imageUrl: pokemonResponse.data.sprites.front_default,
                    types: types,
                    name: frenchName,
                    englishName: pokemon.name,
                    evolutionStage: evolutionStage
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
    }, [typeFilter, sortOrder]);

    const filteredPokemons = pokemons
    .filter(pokemon => typeFilter ? pokemon.types.includes(pokemonTypeMapping[typeFilter]) : true)
    .filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()));

    const sortedPokemons = [...filteredPokemons].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        } else if (sortOrder === 'desc') {
            return b.name.localeCompare(a.name);
        } else {
            return 0;
        }
    });

    const totalPages = Math.ceil(sortedPokemons.length / ITEMS_PER_PAGE);

    const currentPokemons = sortedPokemons.slice(
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
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.englishName}`);
            const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.englishName}`);
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
        } finally {
            setShowEvolutionPopup(true);
            document.body.style.overflow = 'hidden';
        }
    };

    const generateRandomTeam = () => {
        const randomTeam = [];
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * pokemons.length);
            randomTeam.push(pokemons[randomIndex].name);
        }
        setTeam(randomTeam);
        localStorage.setItem('team', JSON.stringify(randomTeam));
    };

    const handleAddToTeam = (pokemonName: string) => {
        if (team.length < 6 && !team.includes(pokemonName)) {
            const newTeam = [...team, pokemonName];
            setTeam(newTeam);
            localStorage.setItem('team', JSON.stringify(newTeam));
        } else if (team.includes(pokemonName)) {
            console.log(pokemonName + ' est déjà dans votre équipe.');
        } else {
            console.log('Votre équipe est déjà complète.');
        }
    };

    const removeLastPokemon = () => {
        const newTeam = [...team];
        newTeam.pop();
        setTeam(newTeam);
        localStorage.setItem('team', JSON.stringify(newTeam));
    };
    
    const clearTeam = () => {
        setTeam([]);
        localStorage.removeItem('team');
    };

    useEffect(() => {
        const storedTeam = localStorage.getItem('team');
        if (storedTeam) {
            const teamFromStorage = JSON.parse(storedTeam);
            setTeam(teamFromStorage);
        }
    }, []);
    
    useEffect(() => {
        if (team.length > 0) {
            console.clear();
            const teamString = 'Votre équipe est :\n' + team.map(pokemonName => '- ' + pokemonName).join('\n');
            console.log(teamString);
        } else {
            console.clear();
            console.log('Compose ton équipe maintenant !');
        }
    }, [team]);

    const handleClosePopup = () => {
        setShowEvolutionPopup(false);
        setSelectedPokemon(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div>
            {isLoading ? (
                <p>Chargement des pokemons...</p>
            ) : (
                <>
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
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <select onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="">Trier par...</option>
                            <option key="asc" value="asc">Ordre alphabétique (A-Z)</option>
                            <option key="desc" value="desc">Ordre alphabétique inversé (Z-A)</option>
                        </select>
                        {team.length === 0 && (
                            <div className='pokeTeam'>
                                <button onClick={generateRandomTeam}>Générer une équipe aléatoire</button>
                            </div>
                        )}
                        {team.length > 0 && (
                            <div className='pokeTeam'>
                                <button onClick={removeLastPokemon}>Supprimer le dernier Pokémon</button>
                                <button onClick={clearTeam}>Vider l'équipe</button>
                            </div>
                        )}
                    </div>
                    {filteredPokemons.length === 0 ? (
                        <p>Désolé, aucun Pokémon ne correspond à votre recherche.</p>
                    ) : (
                        <div className="pokemonList">
                            {currentPokemons.map(pokemon => (
                                <div className="pokemonName" key={pokemon.name}>
                                    <PokeCard pokemon={pokemon} />
                                    <button onClick={() => handleViewEvolutions(pokemon)}>Voir Ses Caractéristiques</button>
                                </div>
                            ))}
                        </div>
                    )}
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
                            onAddToTeam={handleAddToTeam}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default PokeList;