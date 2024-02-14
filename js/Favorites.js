import { GithubUser } from "./GithubUser.js";
// classe que vai conter a lógica dos dados
// como os dados serão estruturados

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.entries =
            JSON.parse(localStorage.getItem("@github-favorites")) || [];
    }
    save() {
        localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
    }

    async add(username) {
        try {
            const userExists = this.entries.find(
                (entry) => entry.login === username
            );

            if (userExists) {
                throw new Error("Usuário já cadastrado");
            }

            const user = await GithubUser.search(username);
            if (user.login === undefined) {
                throw new Error("Usuário não encontrado");
            }

            this.entries = [user, ...this.entries];

            this.update();
            this.save();
        } catch (error) {
            alert(error.message);
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(
            (entry) => entry.login !== user.login
        );

        this.entries = filteredEntries;
        this.update();
        this.save();
    }
}

// classe que vai criar a visualização e eventos do HTML

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector("table tbody");

        this.update();
        this.onadd();
    }
    onadd() {
        const addButton = this.root.querySelector(".search button");

        window.document.onkeyup = (event) => {
            if (event.key === "Enter") {
                const { value } = this.root.querySelector(".search input");
                this.add(value);
            }
        };

        addButton.onclick = () => {
            const { value } = this.root.querySelector(".search input");

            this.add(value);
        };
    }

    update() {
        this.emptyState();

        this.removeAllTr();

        this.entries.forEach((user) => {
            const row = this.createRow();

            row.querySelector(
                ".user img"
            ).src = `https://github.com/${user.login}.png`;

            row.querySelector(".user img").alt = `Imagem de ${user.name}`;

            row.querySelector(".user p").textContent = user.name;

            row.querySelector(
                ".user a"
            ).href = `http://github.com/${user.login}`;

            row.querySelector(".user span").textContent = `/${user.login}`;

            row.querySelector(".repositories").textContent = user.public_repos;

            row.querySelector(".followers").textContent = user.followers;

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Deseja remover o favorito?");

                if (isOk) {
                    this.delete(user);
                }
            };

            this.tbody.append(row);
        });
    }

    createRow() {
        const tr = document.createElement("tr");

        tr.innerHTML = `
           <td class="user">
               <img
                 src="https://github.com/LGustavo07.png"
                 calt="Imagem de perfil"/>
                 <a href="http://github.com/LGustavo07" target="_blank" >
                  <p>Luis Gustavo</p>
                  <span>/LGustavo07</span>
                   </a>
                    </td>
                    <td class="repositories">7</td>
                    <td class="followers">77</td>
                    <td>
                    <button class="remove">Remover</button>
                    </td>      
        `;

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove();
        });
    }

    emptyState() {
        if (this.entries.length === 0) {
            this.root.querySelector(".no-favorites").classList.remove("hide");
        } else {
            this.root.querySelector(".no-favorites").classList.add("hide");
        }
    }
}
