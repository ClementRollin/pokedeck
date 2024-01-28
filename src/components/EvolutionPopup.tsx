import { useState, useEffect } from 'react';
import axios from 'axios';

interface EvolutionPopupProps {
    pokemonId: string;
    pokemonDetails: Pokemon; // Utilisez 'Pokemon' si c'est le type correct pour les détails
    onClose: () => void;
}

interface EvolutionChain {
    species_name: string;
    evolves_to: EvolutionChain[];
}



interface Pokemon {
    name: string;
    url: string;
    imageUrl: string;
    types: string[];
}

const EvolutionPopup = ({ pokemonId, pokemonDetails, onClose }: EvolutionPopupProps) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            try {
                const idMatch = pokemonId.match(/pokemon\/(\d+)\//);
                if (idMatch) {
                    const id = idMatch[1];
                    const response = await axios.get(`/api/evolution-chain/${id}`);
                    setEvolutionChain(response.data.chain);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la chaîne d'évolution:", error);
            }
        };

        fetchEvolutionChain();
    }, [pokemonId]);

    const renderEvolutionChain = (chain: EvolutionChain) => {
        return (
            <div>
                <p>{chain.species_name}</p>
                {chain.evolves_to.map((evolve, index) => (
                    <div key={index}>
                        {renderEvolutionChain(evolve)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="evolution-popup">
            <div className="pokemon-details">
                <h2>Informations sur {pokemonDetails.name}</h2>
                <img src={pokemonDetails.imageUrl} alt={pokemonDetails.name} />
                <p>Types: {pokemonDetails.types.join(', ')}</p>
            </div>
            <div className="evolution-chain">
                <h2>Évolutions</h2>
                {evolutionChain ? (
                    evolutionChain.evolves_to.map((evolve, index) => (
                        <p key={index}>{evolve.species_name}</p>
                    ))
                ) : (
                    <p>Chargement des évolutions...</p>
                )}
            </div>
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

export default EvolutionPopup;