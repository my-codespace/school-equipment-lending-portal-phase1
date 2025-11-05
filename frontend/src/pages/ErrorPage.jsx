import { motion } from "framer-motion";
import  "../styles/ErrorPage.css";

export default function NotFound() {
    return (
        <div className="nf-container">
            <motion.h1
                className="nf-title"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                404
            </motion.h1>

            <motion.p
                className="nf-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Oops! Looks like you drifted into space 🌌
            </motion.p>

            <motion.img
                src="https://cdn-icons-png.flaticon.com/512/3212/3212608.png"
                alt="Astronaut"
                className="nf-image"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
            />

            <motion.a
                href="/"
                className="nf-button"
                whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 20px rgba(100, 149, 237, 0.7)",
                }}
            >
                Take Me Home 🚀
            </motion.a>
        </div>
    );
}
