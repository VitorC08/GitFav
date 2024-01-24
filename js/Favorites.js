import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const lowerCaseUsername = username.toLowerCase();
      const userExists = this.entries.find(
        (entry) => entry.login.toLowerCase() === lowerCaseUsername
      );

      if (userExists) {
        throw new Error("Usuário já cadastrado !");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
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

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector("nav button");
    const inputElement = this.root.querySelector("nav input");

    addButton.onclick = () => {
      const { value } = this.root.querySelector("nav input");

      this.add(value);
    };

    inputElement.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const { value } = inputElement;
        this.add(value);
      }
    });
  }

  update() {
    this.emptyContent();
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Image de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const confirmAction = confirm(
          "tem certeza que deseja deletar essa linha ?"
        );

        if (confirmAction) {
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
            <img src="https://github.com/VitorC08.png" alt="imagem Vitor" />
            <a
            href="http://github.com/VitorC08"
            target="_blank"
            src="foto de Vitor">
            <p>Vitor Sousa</p>
            <span>Vitorc08</span>
            </a>
        </td>
        <td class="repositories">
            4
        </td>
        <td class="followers">
            <p>0
        </td>
        <td>
            <button class="remove">Remover</button>
        </td>`;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }

  emptyContent() {
    if (this.entries.length !== 0) {
      this.root.querySelector(".no-content").classList.add("hide");
    } else {
      this.root.querySelector(".no-content").classList.remove("hide");
    }
  }
}
