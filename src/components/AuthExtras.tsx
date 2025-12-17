"use client";
import { useState } from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthExtrasProps {
  isLogin: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
}

export const AuthExtras = ({
  isLogin,
  termsAccepted,
  setTermsAccepted,
}: AuthExtrasProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleAccept = () => {
    setTermsAccepted(true);
    setModalOpen(false);
  };

  const handleDecline = () => {
    setTermsAccepted(false);
    setModalOpen(false);
  };

  return (
    <>
      <div className={styles.extrasRow}>
        {!isLogin && (
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={termsAccepted}
              readOnly
              onClick={() => setModalOpen(true)}
            />
            <span className={styles.slider}></span>

            <span className={styles.switchText}>
              Acepto los{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
              >
                términos y condiciones
              </a>
            </span>
          </label>
        )}

        {isLogin && (
          <span className={styles.switchText}>
            <a href="/auth/recovery">¿Olvidaste tu contraseña?</a>
          </span>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>📜 Términos y Condiciones</h2>

            <div className={styles.modalScroll}>
              <p><strong>1. Introducción</strong><br />
                Mentana es una plataforma digital que conecta pacientes con especialistas en salud mental. Al utilizar nuestros servicios, aceptas estos términos.
              </p>

              <p><strong>2. Servicios Ofrecidos</strong><br />
                Mentana ofrece agendamiento, pago, generación de boletas y contenidos relacionados con psicología y psiquiatría. Las consultas son realizadas por profesionales certificados, independientes de la plataforma.
              </p>

              <p><strong>3. Responsabilidad del Usuario</strong><br />
                Debes entregar información veraz, respetar las políticas de comportamiento y aceptar los términos de pago correspondientes.
              </p>

              <p><strong>4. Pagos y Comisiones</strong><br />
                Mentana intermedia los pagos y puede retener una comisión por cada consulta realizada. En caso de pagos con Fonasa, Isapre o modalidad particular, se aplican flujos diferenciados.
              </p>

              <p><strong>5. Protección de Datos</strong><br />
                Los datos personales se manejan conforme a la Ley N°19.628 y estándares internacionales de privacidad, incluyendo RGPD cuando corresponda.
              </p>

              <p><strong>6. Propiedad Intelectual</strong><br />
                La plataforma, su contenido y funcionalidades son propiedad de Mentana. Está prohibida su reproducción no autorizada.
              </p>

              <p><strong>7. Modificaciones</strong><br />
                Mentana puede actualizar estos términos. Se notificará a los usuarios cuando ello ocurra.
              </p>

              <h3>🔒 Política de Privacidad</h3>

              <p><strong>Datos que recopilamos:</strong><br />
                Nombre, RUT, correo electrónico, información clínica para emparejamiento, historial de consultas y preferencias.
              </p>

              <p><strong>Uso de la información:</strong><br />
                Personalizar experiencias, facilitar reembolsos, generar métricas de mejora.
              </p>

              <p><strong>Almacenamiento y seguridad:</strong><br />
                Cifrado de extremo a extremo, servidores certificados ISO/IEC 27001 y acceso limitado.
              </p>

              <p><strong>Derechos del usuario:</strong><br />
                Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a contacto@mentana.cl
              </p>

              <h3>⚖️ Cumplimiento Ley 21.331 – Salud Mental</h3>
              <p>
                Mentana garantiza no discriminación, acceso equitativo, privacidad, continuidad de atención y derecho a elegir especialista.
              </p>

              <h3>🤖 Consentimiento Informado – Uso de IA</h3>
              <p>
                Mentana utiliza algoritmos de IA para recomendar especialistas según síntomas, preferencias y objetivos terapéuticos.
                Estas recomendaciones son orientativas y no sustituyen el juicio clínico.
              </p>

              <p>
                La información se procesa de forma anonimizada y conforme a la Ley N°19.628 y RGPD.
              </p>

              <h3>👩‍⚕️ Cláusulas para Profesionales</h3>
              <p>
                Los profesionales deben acreditar título válido, cumplir estándares éticos, emitir boletas válidas y aceptar la comisión de Mentana.
                Son responsables legales de la atención entregada.
              </p>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.acceptBtn} onClick={handleAccept}>
                Aceptar
              </button>

              <button className={styles.declineBtn} onClick={handleDecline}>
                No aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
