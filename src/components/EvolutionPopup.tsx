import { useState, useEffect } from 'react';
import axios from 'axios';

interface EvolutionPopupProps {
    pokemonId: string;
    onClose: () => void;
}

interface EvolutionChain {
    species_name: string;
    evolves_to: EvolutionChain[];
}

const EvolutionPopup = ({ pokemonId, onClose }: EvolutionPopupProps) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            try {
                const evolutionChainId = pokemonId;
                const response = await axios.get(`https://pokeapi.co/api/v2/evolution-chain/${evolutionChainId}`);
                setEvolutionChain(response.data.chain);
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
            <h2>Chaîne d'évolution</h2>
            {evolutionChain ? renderEvolutionChain(evolutionChain) : <p>Chargement...</p>}
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

export default EvolutionPopup;