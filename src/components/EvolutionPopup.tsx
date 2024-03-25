import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pokemon } from './PokeList';

interface EvolutionPopupProps {
    pokemonId: string;
    onClose: () => void;
    pokemonDetails: Pokemon;
    onAddToTeam: (pokemonName: string) => void;
}

interface EvolutionNode {
    species: {
        name: string;
        url: string;
    };
    evolves_to: EvolutionNode[];
}

interface EvolutionDetail {
    name: string;
    imageUrl: string;
    types: string[];
}

const EvolutionPopup: React.FC<EvolutionPopupProps> = ({ pokemonDetails, onClose, onAddToTeam }) => {
    const [evolutionDetails, setEvolutionDetails] = useState<EvolutionDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get(`https://pokeapi.co/api/v2/evolution-chain/${pokemonDetails.evolutionChainId}/`);
                await processEvolutionChain(data.chain);
            } catch (error) {
                console.error("Erreur lors de la récupération de la chaîne d'évolution:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const processEvolutionChain = async (evolutionNode: EvolutionNode) => {
            let evolutions: EvolutionDetail[] = [];
            let currentEvolution: EvolutionNode | null = evolutionNode;
        
            while (currentEvolution) {
                const speciesUrl = currentEvolution.species.url;
                const speciesResponse = await axios.get(speciesUrl);
                const speciesData = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${speciesResponse.data.name}`);
        
                const frenchNameObj = speciesData.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                const frenchName = frenchNameObj ? frenchNameObj.name : speciesResponse.data.name;
        
                const pokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesResponse.data.name}`);
        
                const types = await Promise.all(pokemonData.data.types.map(async (type: { type: { url: string; name: any; }; }) => {
                    const typeResponse = await axios.get(type.type.url);
                    const frenchTypeObj = typeResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                    return frenchTypeObj ? frenchTypeObj.name : type.type.name;
                }));
        
                evolutions.push({
                    name: frenchName,
                    imageUrl: pokemonData.data.sprites.front_default || 'default-image-url.png',
                    types,
                });
        
                currentEvolution = currentEvolution.evolves_to[0];
            }
        
            setEvolutionDetails(evolutions);
        };

        fetchEvolutionChain();
    }, [pokemonDetails]);

    return (
        <>
            <div className="backdrop" onClick={onClose}></div>
            <div className="evolution-popup">
                <h2>Détails du Pokémon</h2>
                <div>
                    <img src={pokemonDetails.imageUrl} alt={pokemonDetails.name} />
                    <p>Types: {pokemonDetails.types.join(', ')}</p>
                    <button onClick={() => onAddToTeam(pokemonDetails.name)}>Ajouter à mon équipe</button>
                </div>
                <div>
                    <h3>Statistiques</h3>
                    <div className="statsContent">
                        {Object.entries(pokemonDetails.stats || {}).map(([statName, statValue]) => (
                            <div className='statsPokemon' key={statName}>
                                <p>{statName}: {statValue}</p>
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: `${(statValue / 150) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <h2>Évolutions</h2>
                {isLoading ? (
                    <p>Chargement des évolutions...</p>
                ) : (
                    <div className="evolutionPokemon">
                        {evolutionDetails.map((evolution, index) => (
                            <div key={index} className="evolution-item">
                                <img src={evolution.imageUrl} alt={evolution.name} />
                                <p>{evolution.name}</p>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={onClose}>Fermer</button>
            </div>
        </>
    );
};

export default EvolutionPopup;