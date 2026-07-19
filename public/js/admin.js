document.querySelectorAll(".confirm-delete").forEach(button => {
  button.addEventListener("click", event => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) {
      event.preventDefault();
    }
  });
});
