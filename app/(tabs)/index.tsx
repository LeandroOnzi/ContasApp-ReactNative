import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';

interface Pessoa {
  id: string;
  nome: string;
  valor: number;
  fixo: boolean;
}

interface Conta {
  id: string;
  nomeConta: string;
  valorTotal: number;
  pessoas: Pessoa[];
}

const App = () => {
  const [valorConta, setValorConta] = useState<string>('');
  const [quantidadePessoas, setQuantidadePessoas] = useState<string>('0');
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nomeConta, setNomeConta] = useState<string>('');
  const [contasPagas, setContasPagas] = useState<Conta[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [contaSelecionada, setContaSelecionada] = useState<Conta | null>(null);

  // Função para adicionar pessoas e dividir o valor da conta
  const adicionarPessoas = () => {
    const valorNum = parseFloat(valorConta);
    const qtdPessoas = parseInt(quantidadePessoas, 10);

    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido para a conta.');
      return;
    }

    if (qtdPessoas <= 0) {
      Alert.alert('Erro', 'A quantidade de pessoas deve ser maior que zero.');
      return;
    }

    const valorPorPessoa = valorNum / qtdPessoas;

    const novasPessoas: Pessoa[] = Array.from({ length: qtdPessoas }, (_, index) => ({
      id: `${index + 1}`,
      nome: '', // Nome vazio inicialmente
      valor: parseFloat(valorPorPessoa.toFixed(2)),
      fixo: false,
    }));
    setPessoas(novasPessoas);
  };

  // Editar o nome de uma pessoa
  const editarNomePessoa = (id: string, novoNome: string) => {
    setPessoas(
      pessoas.map(p => (p.id === id ? { ...p, nome: novoNome } : p))
    );
  };

  // Editar o valor de uma pessoa específica
  const editarValorPessoa = (id: string, novoValor: string) => {
    const novoValorNum = parseFloat(novoValor);
    if (isNaN(novoValorNum) || novoValorNum <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    const pessoaEditada = pessoas.find(p => p.id === id);
    if (pessoaEditada) {
      pessoaEditada.valor = novoValorNum;
      pessoaEditada.fixo = true;

      // Recalcular o valor para as pessoas que não têm valor fixo
      const valorRestante = parseFloat(valorConta) - pessoas.reduce((sum, p) => (p.fixo ? sum + p.valor : sum), 0);
      const pessoasNaoFixas = pessoas.filter(p => !p.fixo && p.id !== id);
      const valorPorPessoa = pessoasNaoFixas.length > 0 ? valorRestante / pessoasNaoFixas.length : 0;

      setPessoas(
        pessoas.map(p => (p.fixo || p.id === id ? p : { ...p, valor: parseFloat(valorPorPessoa.toFixed(2)) }))
      );
    }
  };

  // Função para salvar a conta e limpar o estado
  const salvarConta = () => {
    if (!nomeConta || !valorConta || pessoas.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos antes de salvar.');
      return;
    }

    const novaConta: Conta = {
      id: (contasPagas.length + 1).toString(),
      nomeConta,
      valorTotal: parseFloat(valorConta),
      pessoas,
    };
    setContasPagas([...contasPagas, novaConta]);

    // Limpar campos
    setNomeConta('');
    setValorConta('');
    setQuantidadePessoas('0');
    setPessoas([]);
    Alert.alert('Sucesso', 'Conta salva com sucesso!');
  };

  // Função para abrir modal e ver os detalhes da conta
  const verDetalhesConta = (conta: Conta) => {
    setContaSelecionada(conta);
    setModalVisible(true);
  };

  const renderizarPessoa = ({ item }: { item: Pessoa }) => (
    <View style={styles.pessoaContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nome da Pessoa"
        value={item.nome}
        onChangeText={(text) => editarNomePessoa(item.id, text)}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={item.valor.toString()}
        onChangeText={(text) => editarValorPessoa(item.id, text)}
      />
    </View>
  );

  const renderizarConta = ({ item }: { item: Conta }) => (
    <TouchableOpacity style={styles.contaButton} onPress={() => verDetalhesConta(item)}>
      <Text style={styles.contaText}>{item.nomeConta} - Valor: R$ {item.valorTotal.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cálculo de Contas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Conta"
        value={nomeConta}
        onChangeText={setNomeConta}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor Total da Conta"
        keyboardType="numeric"
        value={valorConta}
        onChangeText={setValorConta}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade de Pessoas"
        keyboardType="numeric"
        value={quantidadePessoas}
        onChangeText={setQuantidadePessoas}
      />

      <Button title="Adicionar Pessoas" onPress={adicionarPessoas} />

      {pessoas.length > 0 && (
        <FlatList
          data={pessoas}
          renderItem={renderizarPessoa}
          keyExtractor={(item) => item.id}
        />
      )}

      <Button title="Salvar Conta" onPress={salvarConta} />

      <Text style={styles.subtitle}>Contas Pagas</Text>
      <FlatList
        data={contasPagas}
        renderItem={renderizarConta}
        keyExtractor={(item) => item.id}
      />

      {/* Modal para exibir os detalhes de uma conta */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {contaSelecionada && (
              <>
                <Text style={styles.modalTitle}>Detalhes da Conta: {contaSelecionada.nomeConta}</Text>
                <Text>Valor Total: R$ {contaSelecionada.valorTotal.toFixed(2)}</Text>
                <Text>Pessoas:</Text>
                {contaSelecionada.pessoas.map(p => (
                  <Text key={p.id}>{p.nome || 'Pessoa sem nome'}: R$ {p.valor.toFixed(2)}</Text>
                ))}
              </>
            )}
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pessoaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contaButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#007bff', // Cor de fundo
  },
  contaText: {
    color: '#fff', // Cor do texto
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default App;
