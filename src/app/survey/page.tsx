"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Survey.module.css";

export default function MentalHealthSurvey() {
    const questions = [
        "¿Considera que la salud mental es igual de importante que la salud física?",
        "¿Percibe que en Chile todavía existe mucho estigma hacia quienes buscan ayuda psicológica?",
        "¿Cree que la mayoría de las personas en Chile no comprende bien qué es la salud mental?",
        "¿Considera que la salud mental debería ser una prioridad para el sistema público de salud?",
        "¿Sabe dónde acudir si necesita apoyo emocional o psicológico?",
        "¿Percibe que el costo del tratamiento psicológico es una barrera importante?",
        "¿Se siente cómodo(a) hablando sobre sus emociones con personas cercanas?",
        "¿Está dispuesto(a) a buscar ayuda profesional si siente que la necesita?",
        "¿Considera que la calidad de atención en salud mental en Chile es insuficiente?",
        "¿Cree que la educación en salud mental debería enseñarse desde edades tempranas?"
    ];

    const [responses, setResponses] = useState<(number | null)[]>(Array(questions.length).fill(null));
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const validateName = (value: string) => {
        if (value.trim().length < 2) {
            setNameError("El nombre debe tener al menos 2 caracteres.");
        } else {
            setNameError("");
        }
    };

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
            setEmailError("Ingresa un correo electrónico válido.");
        } else {
            setEmailError("");
        }
    };

    const handleChange = (index: number, value: number) => {
        const updated = [...responses];
        updated[index] = value;
        setResponses(updated);
    };

    const handleSubmit = async () => {
        if (nameError || emailError) return;

        if (!name.trim() || !email.trim()) {
            alert("Por favor completa tu nombre y correo.");
            return;
        }

        if (responses.includes(null)) {
            alert("Por favor responde todas las preguntas.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.from("survey_link").insert([
            {
                name,
                email,
                responses,
                created_at: new Date().toISOString(),
            },
        ]);

        setLoading(false);

        if (error) {
            console.error(error);
            alert("Ocurrió un error al enviar la encuesta.");
        } else {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className={styles.successMessage}>
                <h2>¡Gracias por responder!</h2>
                <p>Tu opinión es muy valiosa.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Encuesta de Percepción de la Salud Mental</h1>

            <p className={styles.scaleExplanation}>
                Esta encuesta utiliza una escala del <strong>1 al 5</strong>, donde:
                <br /><br />
                <strong>1</strong> = Totalmente en desacuerdo<br />
                <strong>2</strong> = En desacuerdo<br />
                <strong>3</strong> = Neutral / No está seguro(a)<br />
                <strong>4</strong> = De acuerdo<br />
                <strong>5</strong> = Totalmente de acuerdo
            </p>

            {/* Nombre */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Nombre</label>
                <input
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        validateName(e.target.value);
                    }}
                    placeholder="Tu nombre"
                />
                {nameError && <p className={styles.errorText}>{nameError}</p>}
            </div>

            {/* Correo */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Correo</label>
                <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                    }}
                    placeholder="correo@ejemplo.com"
                />
                {emailError && <p className={styles.errorText}>{emailError}</p>}
            </div>

            {questions.map((q, i) => (
                <div key={i} className={styles.questionCard}>
                    <p className={styles.questionText}>{i + 1}. {q}</p>

                    <div className={styles.scaleLabels}>
                        <span>Totalmente <br />en desacuerdo</span>
                        <span>Totalmente <br />de acuerdo</span>
                    </div>
                    

                    <div className={styles.scale}>
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button
                                key={val}
                                className={responses[i] === val ? styles.selectedOption : styles.option}
                                onClick={() => handleChange(i, val)}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                onClick={handleSubmit}
                disabled={loading || nameError !== "" || emailError !== ""}
                className={styles.submitButton}
            >
                {loading ? "Enviando..." : "Enviar encuesta"}
            </button>
        </div>
    );
}
