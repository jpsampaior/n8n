for (const item of $input.all()) {
    item.json.templateParaEnviar = null;
  
    const temD1 = item.json.d1;
    const temD2 = item.json.d2;
    const temD3 = item.json.d3;
    const diasDesdeCriacao = item.json.days_since_creation;
    
    // Calcular dias desde a data d1 se ela existir
    let diasDesdeD1 = 0;
    if (temD1) {
      const dataD1 = new Date(temD1);
      const hoje = new Date();
      const diffTime = hoje.getTime() - dataD1.getTime();
      diasDesdeD1 = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    if (!temD1 && !temD2 && !temD3) {
      item.json.templateParaEnviar = 'd1_semquestionario';
    }
    else if (temD1 && !temD2 && !temD3 && diasDesdeCriacao >= 3 && diasDesdeD1 >= 3) {
      item.json.templateParaEnviar = 'd2_semquestionario';
    }
    else if (temD1 && temD2 && !temD3 && diasDesdeCriacao >= 5 && diasDesdeD1 >= 5) {
      item.json.templateParaEnviar = 'd3_semquestionario';
    }
  }
  
  return $input.all();